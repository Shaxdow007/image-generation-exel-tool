import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
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
    unitPrice: 0
  });

  const updateInvoiceField = (field: keyof Invoice, value: any) => {
    onInvoiceChange({ ...invoice, [field]: value });
  };

  const updateClientInfo = (field: keyof ClientInfo, value: string) => {
    const updatedClient = { ...invoice.client, [field]: value };
    updateInvoiceField('client', updatedClient);
  };

  const updateCompanyField = (field: keyof CompanyInfo, value: string) => {
    onCompanyInfoChange({ ...companyInfo, [field]: value });
  };

  const addItem = () => {
    if (!newItem.reference || !newItem.designation || !newItem.quantity || !newItem.unitPrice) {
      return;
    }

    const item: InvoiceItem = {
      id: Date.now().toString(),
      reference: newItem.reference!,
      designation: newItem.designation!,
      quantity: newItem.quantity!,
      unit: newItem.unit!,
      unitPrice: newItem.unitPrice!,
      amount: newItem.quantity! * newItem.unitPrice!
    };

    const updatedItems = [...invoice.items, item];
    const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    const totalQuantity = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

    onInvoiceChange({
      ...invoice,
      items: updatedItems,
      subtotal,
      netToPay: subtotal - invoice.advance,
      totalQuantity
    });

    setNewItem({
      reference: '',
      designation: '',
      quantity: 1,
      unit: 'M',
      unitPrice: 0
    });
  };

  const removeItem = (itemId: string) => {
    const updatedItems = invoice.items.filter(item => item.id !== itemId);
    const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    const totalQuantity = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

    onInvoiceChange({
      ...invoice,
      items: updatedItems,
      subtotal,
      netToPay: subtotal - invoice.advance,
      totalQuantity
    });
  };

  const updateAdvance = (advance: number) => {
    onInvoiceChange({
      ...invoice,
      advance,
      netToPay: invoice.subtotal - advance
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Générateur de Factures</h1>
      
      {/* Company Information */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Informations de l'Entreprise</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nom de l'entreprise"
            value={companyInfo.name}
            onChange={(e) => updateCompanyField('name', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Adresse"
            value={companyInfo.address}
            onChange={(e) => updateCompanyField('address', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Téléphone"
            value={companyInfo.phone}
            onChange={(e) => updateCompanyField('phone', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Fax"
            value={companyInfo.fax}
            onChange={(e) => updateCompanyField('fax', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="ICE"
            value={companyInfo.ice}
            onChange={(e) => updateCompanyField('ice', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="RC"
            value={companyInfo.rc}
            onChange={(e) => updateCompanyField('rc', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Invoice Header */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Informations de la Facture</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Numéro de facture"
            value={invoice.number}
            onChange={(e) => updateInvoiceField('number', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="date"
            value={invoice.date}
            onChange={(e) => updateInvoiceField('date', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Référence"
            value={invoice.reference}
            onChange={(e) => updateInvoiceField('reference', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Vendeur"
            value={invoice.vendor}
            onChange={(e) => updateInvoiceField('vendor', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Code Client"
            value={invoice.client.code}
            onChange={(e) => updateClientInfo('code', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Nom du Client"
            value={invoice.client.name}
            onChange={(e) => updateClientInfo('name', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Add New Item */}
      <div className="mb-8 p-6 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Ajouter un Article</h2>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
          <input
            type="text"
            placeholder="Référence"
            value={newItem.reference || ''}
            onChange={(e) => setNewItem({ ...newItem, reference: e.target.value })}
            className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Désignation"
            value={newItem.designation || ''}
            onChange={(e) => setNewItem({ ...newItem, designation: e.target.value })}
            className="md:col-span-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="number"
            placeholder="Quantité"
            value={newItem.quantity || ''}
            onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
            className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={newItem.unit || 'M'}
            onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
            className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="M">M</option>
            <option value="U">U</option>
            <option value="KG">KG</option>
            <option value="L">L</option>
          </select>
          <input
            type="number"
            step="0.01"
            placeholder="Prix unitaire"
            value={newItem.unitPrice || ''}
            onChange={(e) => setNewItem({ ...newItem, unitPrice: Number(e.target.value) })}
            className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={addItem}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter l'article
        </button>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Articles</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-3 text-left">Référence</th>
                <th className="border border-gray-300 p-3 text-left">Désignation</th>
                <th className="border border-gray-300 p-3 text-center">Qté</th>
                <th className="border border-gray-300 p-3 text-center">Ct</th>
                <th className="border border-gray-300 p-3 text-right">P.U HT</th>
                <th className="border border-gray-300 p-3 text-right">Montant HT</th>
                <th className="border border-gray-300 p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3">{item.reference}</td>
                  <td className="border border-gray-300 p-3">{item.designation}</td>
                  <td className="border border-gray-300 p-3 text-center">{item.quantity}</td>
                  <td className="border border-gray-300 p-3 text-center">{item.unit}</td>
                  <td className="border border-gray-300 p-3 text-right">{item.unitPrice.toFixed(2)}</td>
                  <td className="border border-gray-300 p-3 text-right">{item.amount.toFixed(2)}</td>
                  <td className="border border-gray-300 p-3 text-center">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Totaux</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Avance</label>
            <input
              type="number"
              step="0.01"
              value={invoice.advance}
              onChange={(e) => updateAdvance(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Total</label>
            <div className="w-full p-3 bg-gray-200 rounded-md text-right font-semibold">
              {invoice.subtotal.toFixed(2)}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Net à Payer</label>
            <div className="w-full p-3 bg-green-100 border-2 border-green-300 rounded-md text-right font-bold text-green-800">
              {invoice.netToPay.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}