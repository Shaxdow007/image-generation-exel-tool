import React, { useState } from "react";
import {
  Printer,
  Eye,
  EyeOff,
  FileText,
  History,
  Download,
  Upload,
  Sun,
  Moon,
  Settings,
} from "lucide-react";
import { InvoiceForm } from "./components/InvoiceForm";
import { InvoicePreview } from "./components/InvoicePreview";
import { InvoicePrint } from "./components/InvoicePrint";
import { InvoiceHistory } from "./components/InvoiceHistory";
import { ExportImportPanel } from "./components/ExportImportPanel";
import { Invoice, CompanyInfo, ClientInfo } from "./types/invoice";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useInvoiceHistory } from "./hooks/useInvoiceHistory";
import { useTheme } from "./hooks/useTheme";

function App() {
  const [activeTab, setActiveTab] = useState<"form" | "history" | "export">(
    "form"
  );
  const [showPreview, setShowPreview] = useState(true);
  const { theme, toggleTheme } = useTheme();

  const { addHistoryEntry, getDiff } = useInvoiceHistory();

  const [invoice, setInvoice] = useLocalStorage<Invoice>("invoice", {
    id: "1",
    number: "BLH2504637",
    date: "2025-01-18",
    reference: "Bon de livraison",
    vendor: "LOUBNA",
    client: {
      id: "1",
      code: "CL02169",
      name: "STI THERMIQUE",
      address: "",
      chantier: "",
      mode: "",
    },
    items: [
      {
        id: "1",
        reference: "CBS1V1.5",
        designation: "CABLE SV1V 5*1.5 ING-NEX",
        quantity: 300,
        unit: "M",
        unitPrice: 10.9,
        amount: 3270.0,
        tvaRate: 20,
        discount: 0,
      },
      {
        id: "2",
        reference: "CBS1V1.5",
        designation: "CABLE SV1V 2*1.5 ING-NEX",
        quantity: 200,
        unit: "M",
        unitPrice: 4.4,
        amount: 880.0,
        tvaRate: 20,
        discount: 0,
      },
      {
        id: "3",
        reference: "CBS1V2.5",
        designation: "CABLE SV1V 2*2.5 ING-NEX",
        quantity: 100,
        unit: "M",
        unitPrice: 7.35,
        amount: 735.0,
        tvaRate: 20,
        discount: 0,
      },
      {
        id: "4",
        reference: "DVS1920",
        designation: "SCOTCH GM 19*20 SIGMA/ORBUS/20YDS",
        quantity: 40,
        unit: "U",
        unitPrice: 4.8,
        amount: 192.0,
        tvaRate: 20,
        discount: 0,
      },
      {
        id: "5",
        reference: "JN1634/04N",
        designation: "COLLIER COLSON 7,6*340 NOIR 1634/04N",
        quantity: 500,
        unit: "U",
        unitPrice: 0.63,
        amount: 315.0,
        tvaRate: 20,
        discount: 0,
      },
      {
        id: "6",
        reference: "JN1626/04N",
        designation: "COLLIER COLSON 7,6*265 NOIR 1626/04N",
        quantity: 3,
        unit: "U",
        unitPrice: 0.27,
        amount: 0.81,
        tvaRate: 20,
        discount: 0,
      },
    ],
    subtotal: 5392.81,
    totalTva: 1078.56,
    totalTtc: 6471.37,
    advance: 0,
    netToPay: 6471.37,
    totalQuantity: 1143,
    status: "draft",
    currency: "MAD",
    globalDiscount: 0,
    tvaMode: "exclusive",
    payments: [],
    history: [
      {
        id: "1",
        timestamp: new Date().toISOString(),
        user: "System",
        action: "created",
        notes: "Facture créée automatiquement",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
  });

  const [companyInfo, setCompanyInfo] = useLocalStorage<CompanyInfo>(
    "companyInfo",
    {
      name: "FATH AL MASSAR",
      address: "LOT 970 ROUTE DE SAFI | LOTISSEMENT AL MASSAR",
      phone: "05 24 20 54 00, 06 62 40 78 46 / 06 62 42 40 34",
      fax: "05 24 20 54 30",
      ice: "002914784000038",
      rc: "121283 - I.F 50668141",
      colorTheme: "#3B82F6",
      fontSize: 14,
    }
  );

  const [clients, setClients] = useLocalStorage<ClientInfo[]>("clients", []);

  const handleInvoiceChange = (newInvoice: Invoice) => {
    const changes = getDiff(invoice, newInvoice);
    const updatedInvoice = addHistoryEntry(newInvoice, "edited", changes);
    setInvoice(updatedInvoice);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleImportData = (data: any) => {
    console.log("Importing data:", data);

    // Import clients
    if (data.clients && Array.isArray(data.clients)) {
      const existingCodes = clients.map((c) => c.code);
      const newClients = data.clients.filter(
        (client: ClientInfo) => !existingCodes.includes(client.code)
      );
      if (newClients.length > 0) {
        setClients((prev) => [...prev, ...newClients]);
      }
    }

    // Import items (add to current invoice)
    if (data.items && Array.isArray(data.items)) {
      const updatedInvoice = {
        ...invoice,
        items: [...invoice.items, ...data.items],
      };

      // Recalculate totals
      const subtotal = updatedInvoice.items.reduce(
        (sum, item) => sum + (item.amount || 0),
        0
      );
      const totalTva = updatedInvoice.items.reduce((sum, item) => {
        const amount = item.amount || 0;
        const tvaRate = item.tvaRate || 0;
        return sum + (amount * tvaRate) / 100;
      }, 0);
      const totalTtc = subtotal + totalTva;
      const totalQuantity = updatedInvoice.items.reduce(
        (sum, item) => sum + (item.quantity || 0),
        0
      );

      updatedInvoice.subtotal = subtotal;
      updatedInvoice.totalTva = totalTva;
      updatedInvoice.totalTtc = totalTtc;
      updatedInvoice.totalQuantity = totalQuantity;
      updatedInvoice.netToPay = totalTtc - (updatedInvoice.advance || 0);

      handleInvoiceChange(updatedInvoice);
    }

    // Import invoices (for future implementation)
    if (data.invoices && Array.isArray(data.invoices)) {
      console.log("Invoice import not yet implemented");
    }
  };

  const tabs = [
    { id: "form", label: "Facture", icon: FileText },
    { id: "history", label: "Historique", icon: History },
    { id: "export", label: "Export/Import", icon: Download },
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 print:hidden transition-colors duration-300">
        <div className="container mx-auto py-8 px-4 max-w-7xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-primary-600 to-blue-600 rounded-xl shadow-lg">
                <img
                  src="./images/logo.svg"
                  alt="Image Generation Excel Tool logo"
                  className="w-10 h-10"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                  Système de Facturation Pro
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Gestion professionnelle de vos factures et devis
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 transform hover:scale-105"
              >
                {theme === "light" ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={() => setShowPreview(!showPreview)}
                className="inline-flex items-center px-4 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 transform hover:scale-105"
              >
                {showPreview ? (
                  <EyeOff className="w-4 h-4 mr-2" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                {showPreview ? "Masquer" : "Aperçu"}
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-xl hover:from-primary-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimer
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-2 mb-8 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-primary-600 to-blue-600 text-white shadow-lg transform scale-105"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Main Content */}
            <div className="space-y-6">
              {activeTab === "form" && (
                <InvoiceForm
                  invoice={invoice}
                  companyInfo={companyInfo}
                  onInvoiceChange={handleInvoiceChange}
                  onCompanyInfoChange={setCompanyInfo}
                />
              )}

              {activeTab === "history" && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                  <InvoiceHistory invoice={invoice} />
                </div>
              )}

              {activeTab === "export" && (
                <ExportImportPanel
                  invoices={[invoice]}
                  clients={clients}
                  onImportData={handleImportData}
                />
              )}
            </div>

            {/* Preview */}
            {showPreview && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-slide-up">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                      Aperçu du Document
                    </h2>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          invoice.status === "draft"
                            ? "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                            : invoice.status === "sent"
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300"
                            : invoice.status === "paid"
                            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300"
                            : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300"
                        }`}
                      >
                        {invoice.status}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Version {invoice.version}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-900">
                  <div
                    className="transform scale-75 origin-top-left"
                    style={{ width: "133%", height: "133%" }}
                  >
                    <InvoicePreview
                      invoice={invoice}
                      companyInfo={companyInfo}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print Version */}
      <InvoicePrint invoice={invoice} companyInfo={companyInfo} />
    </>
  );
}

export default App;
