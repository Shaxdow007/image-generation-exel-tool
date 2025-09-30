import React, { useState } from 'react';
import { Plus, Trash2, CreditCard as Edit3, Save, X, Package } from 'lucide-react';
import { Invoice, InvoiceItem, CompanyInfo, ClientInfo } from '../types/invoice';

interface InvoiceFormProps {
  invoice: Invoice;
  companyInfo: CompanyInfo;
  onInvoiceChange: (invoice: Invoice) => void;
  onCompanyInfoChange: (info: CompanyInfo) => void;
}

export function InvoiceForm({ invoice, companyInfo, onInvoiceChange, onCompanyInfoChange }: InvoiceFormProps) {
  const [newItem, setNewItem] = useState<Partial<InvoiceItem>>({
    reference: '',
    designation: '',
    quantity: 1,
    unit: 'M',
    unitPrice: 0,
    tvaRate: 20,
    discount: 0
  });
  
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<InvoiceItem | null>(null);

  const updateInvoiceField = (field: keyof Invoice, value: any) => {
    onInvoiceChange({ ...invoice, [field]: value });
  };

  const updateClientInfo = (field: keyof ClientInfo, value: string) => {
    const updatedClient = { ...invoice.client, [field]: value };
    updateInvoiceField('client', updatedClient);
  };

  const updateCompanyField = (field: keyof CompanyInfo, value: string | number) => {
    onCompanyInfoChange({ ...companyInfo, [field]: value });
  };

  const calculateTotals = (items: InvoiceItem[]) => {
    const subtotal = items.reduce((sum, item) => {
      const discountedAmount = item.amount * (1 - item.discount / 100);
      return sum + discountedAmount;
    }, 0);
    
    const totalTva = items.reduce((sum, item) => {
      const discountedAmount = item.amount * (1 - item.discount / 100);
      return sum + (discountedAmount * item.tvaRate / 100);
    }, 0);
    
    const totalTtc = subtotal + totalTva;
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    
    return { subtotal, totalTva, totalTtc, totalQuantity };
  };

  const addItem = () => {
    if (!newItem.reference || !newItem.designation || !newItem.quantity || !newItem.unitPrice) {
      return;
    }

    const item: InvoiceItem = {
      id: Date.now().toString(),
      reference: newItem.reference!,
      designation: newItem.designation!,
      quantity: Number(newItem.quantity) || 0,
      unit: newItem.unit!,
      unitPrice: Number(newItem.unitPrice) || 0,
      amount: (Number(newItem.quantity) || 0) * (Number(newItem.unitPrice) || 0),
      tvaRate: Number(newItem.tvaRate) || 20,
      discount: Number(newItem.discount) || 0
    };

    const updatedItems = [...invoice.items, item];
    const totals = calculateTotals(updatedItems);

    onInvoiceChange({
      ...invoice,
      items: updatedItems,
      ...totals,
      netToPay: totals.totalTtc - invoice.advance,
    });

    setNewItem({
      reference: '',
      designation: '',
      quantity: 1,
      unit: 'M',
      unitPrice: 0,
      tvaRate: 20,
      discount: 0
    });
  };

  const startEditing = (item: InvoiceItem) => {
    setEditingItem(item.id);
    setEditingData({ ...item });
  };

  const saveEdit = () => {
    if (!editingData || !editingItem) return;

    const updatedItems = invoice.items.map(item =>
      item.id === editingItem
        ? { 
            ...editingData, 
            quantity: Number(editingData.quantity) || 0,
            unitPrice: Number(editingData.unitPrice) || 0,
            tvaRate: Number(editingData.tvaRate) || 20,
            discount: Number(editingData.discount) || 0,
            amount: (Number(editingData.quantity) || 0) * (Number(editingData.unitPrice) || 0)
          }
        : item
    );

    const totals = calculateTotals(updatedItems);

    onInvoiceChange({
      ...invoice,
      items: updatedItems,
      ...totals,
      netToPay: totals.totalTtc - invoice.advance,
    });

    setEditingItem(null);
    setEditingData(null);
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditingData(null);
  };

  const removeItem = (itemId: string) => {
    const updatedItems = invoice.items.filter(item => item.id !== itemId);
    const totals = calculateTotals(updatedItems);

    onInvoiceChange({
      ...invoice,
      items: updatedItems,
      ...totals,
      netToPay: totals.totalTtc - invoice.advance,
    });
  };

  const updateAdvance = (advance: number) => {
    onInvoiceChange({
      ...invoice,
      advance,
      netToPay: invoice.totalTtc - advance
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Company Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 hover:shadow-xl">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white flex items-center">
          <Package className="w-5 h-5 mr-2 text-primary-600" />
          Informations de l'Entreprise
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nom de l'entreprise
            </label>
            <input
              type="text"
              value={companyInfo.name}
              onChange={(e) => updateCompanyField('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Adresse
            </label>
            <input
              type="text"
              value={companyInfo.address}
              onChange={(e) => updateCompanyField('address', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Téléphone
            </label>
            <input
              type="text"
              value={companyInfo.phone}
              onChange={(e) => updateCompanyField('phone', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Fax
            </label>
            <input
              type="text"
              value={companyInfo.fax}
              onChange={(e) => updateCompanyField('fax', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              ICE
            </label>
            <input
              type="text"
              value={companyInfo.ice}
              onChange={(e) => updateCompanyField('ice', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              RC
            </label>
            <input
              type="text"
              value={companyInfo.rc}
              onChange={(e) => updateCompanyField('rc', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Invoice Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 hover:shadow-xl">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">
          Informations de la Facture
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Numéro de facture
            </label>
            <input
              type="text"
              value={invoice.number}
              onChange={(e) => updateInvoiceField('number', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date
            </label>
            <input
              type="date"
              value={invoice.date}
              onChange={(e) => updateInvoiceField('date', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Référence
            </label>
            <input
              type="text"
              value={invoice.reference}
              onChange={(e) => updateInvoiceField('reference', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Vendeur
            </label>
            <input
              type="text"
              value={invoice.vendor}
              onChange={(e) => updateInvoiceField('vendor', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Code Client
            </label>
            <input
              type="text"
              value={invoice.client.code}
              onChange={(e) => updateClientInfo('code', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nom du Client
            </label>
            <input
              type="text"
              value={invoice.client.name}
              onChange={(e) => updateClientInfo('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Chantier
            </label>
            <input
              type="text"
              value={invoice.client.chantier || ''}
              onChange={(e) => updateClientInfo('chantier', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mode
            </label>
            <input
              type="text"
              value={invoice.client.mode || ''}
              onChange={(e) => updateClientInfo('mode', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Add New Item */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg border border-primary-200 dark:border-gray-600 p-6 transition-all duration-200">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white flex items-center">
          <Plus className="w-5 h-5 mr-2 text-primary-600" />
          Ajouter un Article
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Référence
            </label>
            <input
              type="text"
              value={newItem.reference || ''}
              onChange={(e) => setNewItem({ ...newItem, reference: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Désignation
            </label>
            <input
              type="text"
              value={newItem.designation || ''}
              onChange={(e) => setNewItem({ ...newItem, designation: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Quantité
            </label>
            <input
              type="number"
              value={newItem.quantity || ''}
              onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Unité
            </label>
            <select
              value={newItem.unit || 'M'}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            >
              <option value="M">M</option>
              <option value="U">U</option>
              <option value="KG">KG</option>
              <option value="L">L</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Prix unitaire
            </label>
            <input
              type="number"
              step="0.01"
              value={newItem.unitPrice || ''}
              onChange={(e) => setNewItem({ ...newItem, unitPrice: Number(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              TVA %
            </label>
            <input
              type="number"
              value={newItem.tvaRate || 20}
              onChange={(e) => setNewItem({ ...newItem, tvaRate: Number(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            />
          </div>
        </div>
        <button
          onClick={addItem}
          className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter l'article
        </button>
      </div>

      {/* Items Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Articles</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Référence</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Désignation</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Qté</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ct</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">P.U HT</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">TVA %</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Montant TTC</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {invoice.items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                  {editingItem === item.id ? (
                    <>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={editingData?.reference || ''}
                          onChange={(e) => setEditingData(prev => prev ? { ...prev, reference: e.target.value } : null)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={editingData?.designation || ''}
                          onChange={(e) => setEditingData(prev => prev ? { ...prev, designation: e.target.value } : null)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={editingData?.quantity || ''}
                          onChange={(e) => setEditingData(prev => prev ? { ...prev, quantity: Number(e.target.value) } : null)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={editingData?.unit || 'M'}
                          onChange={(e) => setEditingData(prev => prev ? { ...prev, unit: e.target.value } : null)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="M">M</option>
                          <option value="U">U</option>
                          <option value="KG">KG</option>
                          <option value="L">L</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          step="0.01"
                          value={editingData?.unitPrice || ''}
                          onChange={(e) => setEditingData(prev => prev ? { ...prev, unitPrice: Number(e.target.value) } : null)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-right bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={editingData?.tvaRate || ''}
                          onChange={(e) => setEditingData(prev => prev ? { ...prev, tvaRate: Number(e.target.value) } : null)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-right bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </td>
                      <td className="px-6 py-4 text-right text-gray-900 dark:text-white font-medium">
                        {((editingData?.quantity || 0) * (editingData?.unitPrice || 0) || 0).toFixed(2).replace('.', ',')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={saveEdit}
                            className="text-green-600 hover:text-green-800 transition-colors p-1 rounded-md hover:bg-green-100 dark:hover:bg-green-900"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-red-600 hover:text-red-800 transition-colors p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{item.reference}</td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">{item.designation}</td>
                      <td className="px-6 py-4 text-center text-gray-900 dark:text-white">{item.quantity}</td>
                      <td className="px-6 py-4 text-center text-gray-900 dark:text-white">{item.unit}</td>
                      <td className="px-6 py-4 text-right text-gray-900 dark:text-white">{(item.unitPrice || 0).toFixed(2).replace('.', ',')}</td>
                      <td className="px-6 py-4 text-right text-gray-900 dark:text-white">{item.tvaRate}%</td>
                      <td className="px-6 py-4 text-right text-gray-900 dark:text-white font-medium">{(item.amount || 0).toFixed(2).replace('.', ',')}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => startEditing(item)}
                            className="text-primary-600 hover:text-primary-800 transition-colors p-1 rounded-md hover:bg-primary-100 dark:hover:bg-primary-900"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-800 transition-colors p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">Totaux</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Avance</label>
            <input
              type="number"
              step="0.01"
              value={invoice.advance}
              onChange={(e) => updateAdvance(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total HT</label>
            <div className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-right font-semibold text-gray-900 dark:text-white">
              {(invoice.subtotal || 0).toFixed(2).replace('.', ',')}
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total TVA</label>
            <div className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-right font-semibold text-gray-900 dark:text-white">
              {(invoice.totalTva || 0).toFixed(2).replace('.', ',')}
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Net à Payer</label>
            <div className="w-full px-4 py-3 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 border-2 border-green-300 dark:border-green-600 rounded-lg text-right font-bold text-green-800 dark:text-green-200">
              {(invoice.netToPay || 0).toFixed(2).replace('.', ',')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}