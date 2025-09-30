import React, { useState, useRef } from 'react';
import { Download, Upload, FileText, Database, Package, AlertCircle, CheckCircle, X, Eye } from 'lucide-react';
import { Invoice, ClientInfo, InvoiceItem } from '../types/invoice';
import { useExportImport } from '../hooks/useExportImport';

interface ExportImportPanelProps {
  invoices: Invoice[];
  clients: ClientInfo[];
  onImportData: (data: any) => void;
}

interface ImportPreview {
  clients?: ClientInfo[];
  items?: InvoiceItem[];
  invoices?: Partial<Invoice>[];
  errors?: string[];
}

export function ExportImportPanel({ invoices, clients, onImportData }: ExportImportPanelProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { exportToPDF, exportToCSV, exportToJSON, importFromCSV, createBackup } = useExportImport();

  const handleExportCSV = () => {
    let filteredInvoices = invoices;
    if (dateRange.start && dateRange.end) {
      filteredInvoices = invoices.filter(inv => 
        inv.date >= dateRange.start && inv.date <= dateRange.end
      );
    }
    exportToCSV(filteredInvoices);
  };

  const handleCreateBackup = () => {
    createBackup(invoices, clients);
  };

  const validateImportData = (data: any): ImportPreview => {
    const preview: ImportPreview = { errors: [] };
    
    try {
      if (data.clients) {
        preview.clients = data.clients.filter((client: any) => client.name && client.code);
        if (data.clients.length !== preview.clients.length) {
          preview.errors?.push(`${data.clients.length - preview.clients.length} clients ignorés (nom ou code manquant)`);
        }
      }
      
      if (data.items) {
        preview.items = data.items.filter((item: any) => item.reference && item.designation);
        if (data.items.length !== preview.items.length) {
          preview.errors?.push(`${data.items.length - preview.items.length} articles ignorés (référence ou désignation manquante)`);
        }
      }
      
      if (data.invoices) {
        preview.invoices = data.invoices.filter((inv: any) => inv.number && inv.date);
        if (data.invoices.length !== preview.invoices.length) {
          preview.errors?.push(`${data.invoices.length - preview.invoices.length} factures ignorées (numéro ou date manquante)`);
        }
      }
    } catch (error) {
      preview.errors?.push('Erreur lors de la validation des données');
    }
    
    return preview;
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportSuccess(false);

    try {
      let data: any = {};
      
      if (file.name.endsWith('.csv')) {
        data = await importFromCSV(file);
      } else if (file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const jsonData = JSON.parse(e.target?.result as string);
            data = jsonData.data || jsonData;
            const preview = validateImportData(data);
            setImportPreview(preview);
          } catch (error) {
            setImportPreview({ errors: ['Erreur lors de la lecture du fichier JSON'] });
          }
        };
        reader.readAsText(file);
        setIsImporting(false);
        return;
      }
      
      const preview = validateImportData(data);
      setImportPreview(preview);
    } catch (error) {
      setImportPreview({ errors: ['Erreur lors de l\'importation du fichier'] });
    }
    
    setIsImporting(false);
  };

  const confirmImport = () => {
    if (importPreview) {
      onImportData(importPreview);
      setImportSuccess(true);
      setTimeout(() => {
        setImportPreview(null);
        setImportSuccess(false);
      }, 3000);
    }
  };

  const cancelImport = () => {
    setImportPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tab Navigation */}
      <div className="flex space-x-2 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('export')}
          className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'export'
              ? 'bg-primary-600 text-white shadow-lg transform scale-105'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'import'
              ? 'bg-primary-600 text-white shadow-lg transform scale-105'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <Upload className="w-4 h-4 mr-2" />
          Import
        </button>
      </div>

      {activeTab === 'export' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 hover:shadow-xl">
          <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white flex items-center">
            <Download className="w-6 h-6 mr-3 text-primary-600" />
            Exporter les données
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date de début
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date de fin
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleExportCSV}
              className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FileText className="w-5 h-5 mr-2" />
              Export CSV
            </button>
            
            <button
              onClick={() => exportToJSON(invoices, `invoices_${new Date().toISOString().split('T')[0]}.json`)}
              className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Database className="w-5 h-5 mr-2" />
              Export JSON
            </button>
            
            <button
              onClick={handleCreateBackup}
              className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Package className="w-5 h-5 mr-2" />
              Sauvegarde complète
            </button>
          </div>
        </div>
      )}

      {activeTab === 'import' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 hover:shadow-xl">
            <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white flex items-center">
              <Upload className="w-6 h-6 mr-3 text-primary-600" />
              Importer des données
            </h3>
            
            {!importPreview && (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center transition-all duration-200 hover:border-primary-400 dark:hover:border-primary-500">
                <Upload className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg">
                  Glissez-déposez vos fichiers ici ou cliquez pour sélectionner
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Formats supportés: CSV, JSON
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json"
                  onChange={handleImportFile}
                  className="hidden"
                  disabled={isImporting}
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isImporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Importation...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Sélectionner un fichier
                    </>
                  )}
                </button>
              </div>
            )}

            {importPreview && (
              <div className="space-y-6 animate-slide-up">
                <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
                    <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                      Aperçu de l'importation
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {importPreview.clients && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Clients</div>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {importPreview.clients.length}
                        </div>
                      </div>
                    )}
                    {importPreview.items && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Articles</div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {importPreview.items.length}
                        </div>
                      </div>
                    )}
                    {importPreview.invoices && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Factures</div>
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {importPreview.invoices.length}
                        </div>
                      </div>
                    )}
                  </div>

                  {importPreview.errors && importPreview.errors.length > 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-4">
                      <div className="flex items-center mb-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                        <span className="font-medium text-yellow-800 dark:text-yellow-200">Avertissements</span>
                      </div>
                      <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                        {importPreview.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <button
                      onClick={confirmImport}
                      className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirmer l'importation
                    </button>
                    <button
                      onClick={cancelImport}
                      className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}

            {importSuccess && (
              <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-xl p-6 animate-scale-in">
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
                  <span className="text-green-800 dark:text-green-200 font-medium">
                    Importation réussie !
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900 dark:to-orange-900 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Format CSV attendu:
            </h4>
            <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
              <div>
                <strong>Clients:</strong>
                <code className="ml-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-800 rounded text-xs">
                  Name,Code,ICE,RC,Phone,Email,Address,City,Country
                </code>
              </div>
              <div>
                <strong>Articles:</strong>
                <code className="ml-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-800 rounded text-xs">
                  Reference,Designation,Unit,UnitPrice,TVARate
                </code>
              </div>
              <div>
                <strong>Factures:</strong>
                <code className="ml-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-800 rounded text-xs">
                  Number,Date,ClientCode,Vendor,Reference,Status
                </code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}