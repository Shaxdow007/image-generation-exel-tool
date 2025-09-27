import React, { useState } from 'react';
import { Printer, Eye, EyeOff, FileText } from 'lucide-react';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';
import { InvoicePrint } from './components/InvoicePrint';
import { Invoice, CompanyInfo } from './types/invoice';
import { useLocalStorage } from './hooks/useLocalStorage';

function App() {
  const [showPreview, setShowPreview] = useState(true);
  
  const [invoice, setInvoice] = useLocalStorage<Invoice>('invoice', {
    number: 'BLH' + Date.now().toString().slice(-6),
    date: new Date().toISOString().split('T')[0],
    reference: 'Bon de livraison',
    vendor: '',
    client: {
      code: '',
      name: '',
    },
    items: [],
    subtotal: 0,
    advance: 0,
    netToPay: 0,
    totalQuantity: 0,
  });

  const [companyInfo, setCompanyInfo] = useLocalStorage<CompanyInfo>('companyInfo', {
    name: '',
    address: '',
    phone: '',
    fax: '',
    ice: '',
    rc: '',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 print:hidden">
        <div className="container mx-auto py-8 px-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-800">Générateur de Factures Pro</h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showPreview ? 'Masquer' : 'Aperçu'}
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimer
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Form */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <InvoiceForm
                invoice={invoice}
                companyInfo={companyInfo}
                onInvoiceChange={setInvoice}
                onCompanyInfoChange={setCompanyInfo}
              />
            </div>

            {/* Preview */}
            {showPreview && (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800">Aperçu du Document</h2>
                </div>
                <div className="p-6 bg-gray-50">
                  <div className="transform scale-75 origin-top-left" style={{ width: '133%', height: '133%' }}>
                    <InvoicePreview invoice={invoice} companyInfo={companyInfo} />
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