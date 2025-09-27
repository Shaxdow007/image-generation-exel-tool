import React from 'react';
import { Invoice, CompanyInfo } from '../types/invoice';

interface InvoicePrintProps {
  invoice: Invoice;
  companyInfo: CompanyInfo;
}

export function InvoicePrint({ invoice, companyInfo }: InvoicePrintProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="print:block hidden">
      <div className="max-w-4xl mx-auto bg-white p-8 text-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold uppercase tracking-wider">{companyInfo.name}</h1>
          <p className="text-sm mt-2">{companyInfo.address}</p>
          <div className="flex justify-center space-x-8 mt-2 text-xs">
            <span>Tel : {companyInfo.phone}</span>
            <span>Fax : {companyInfo.fax}</span>
          </div>
          <div className="flex justify-center space-x-8 mt-1 text-xs">
            <span>ICE : {companyInfo.ice}</span>
            <span>R.C : {companyInfo.rc}</span>
          </div>
        </div>

        <div className="border-t-2 border-gray-300 pt-4 mb-6">
          <h2 className="text-lg font-semibold text-center mb-4">Bon de livraison</h2>
          <div className="text-right mb-2 text-xs">Page: 1</div>
        </div>

        {/* Invoice Details */}
        <div className="flex justify-between mb-6">
          <div className="border border-gray-400 p-4 w-5/12">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><strong>BON N°</strong></div>
              <div>: {invoice.number}</div>
              <div><strong>Date</strong></div>
              <div>: {formatDate(invoice.date)}</div>
              <div><strong>V/Réf</strong></div>
              <div>: {invoice.reference}</div>
              <div><strong>Vendeur</strong></div>
              <div>: {invoice.vendor}</div>
            </div>
          </div>

          <div className="border border-gray-400 p-4 w-5/12">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><strong>Code Client</strong></div>
              <div>: {invoice.client.code}</div>
              <div><strong>Nom Client</strong></div>
              <div>: {invoice.client.name}</div>
              <div><strong>Chantier</strong></div>
              <div>:</div>
              <div><strong>Mode</strong></div>
              <div>:</div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full border-collapse border border-gray-400 mb-6 text-xs">
          <thead>
            <tr>
              <th className="border border-gray-400 p-2 text-left bg-gray-100">Référence</th>
              <th className="border border-gray-400 p-2 text-left bg-gray-100">Désignation</th>
              <th className="border border-gray-400 p-2 text-center bg-gray-100">Qté</th>
              <th className="border border-gray-400 p-2 text-center bg-gray-100">Ct</th>
              <th className="border border-gray-400 p-2 text-right bg-gray-100">P.U HT</th>
              <th className="border border-gray-400 p-2 text-right bg-gray-100">Montant HT</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td className="border border-gray-400 p-2">{item.reference}</td>
                <td className="border border-gray-400 p-2">{item.designation}</td>
                <td className="border border-gray-400 p-2 text-center">{item.quantity}</td>
                <td className="border border-gray-400 p-2 text-center">{item.unit}</td>
                <td className="border border-gray-400 p-2 text-right">{item.unitPrice.toFixed(2)}</td>
                <td className="border border-gray-400 p-2 text-right">{item.amount.toFixed(2)}</td>
              </tr>
            ))}
            {/* Empty rows for spacing */}
            {Array.from({ length: Math.max(0, 10 - invoice.items.length) }).map((_, index) => (
              <tr key={`empty-${index}`}>
                <td className="border border-gray-400 p-2 h-8"></td>
                <td className="border border-gray-400 p-2"></td>
                <td className="border border-gray-400 p-2"></td>
                <td className="border border-gray-400 p-2"></td>
                <td className="border border-gray-400 p-2"></td>
                <td className="border border-gray-400 p-2"></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="flex justify-between items-end">
          <div className="text-xs">
            <p className="mb-2">Les articles vendus ne sont ni</p>
            <p className="mb-2">repris ni échangé après un délais</p>
            <p className="mb-4">de dix jours (10 jours).</p>
            <p><strong>11:16:07</strong></p>
            <p className="mt-2">Quantité: <strong>{invoice.totalQuantity.toFixed(2)}</strong></p>
          </div>

          <div className="text-center">
            <div className="border border-blue-500 text-blue-600 font-bold text-2xl p-4 mb-4 transform rotate-12">
              Virement
            </div>
          </div>

          <div className="text-right">
            <div className="border border-gray-400 p-3 mb-2 text-center">
              <strong>TOTAL</strong>
              <div className="font-bold text-lg">{invoice.subtotal.toFixed(2)}</div>
            </div>
            <div className="border border-gray-400 p-3 mb-2 text-center">
              <strong>AVANCE</strong>
              <div>{invoice.advance.toFixed(2)} * * * *</div>
            </div>
            <div className="border-2 border-gray-600 p-3 text-center bg-gray-100">
              <strong>NET A PAYER</strong>
              <div className="font-bold text-lg">{invoice.netToPay.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}