import React from 'react';
import { Clock, User, CreditCard as Edit, Send, CreditCard, X, CheckCircle, Copy, RotateCcw } from 'lucide-react';
import { Invoice, HistoryEntry } from '../types/invoice';

interface InvoiceHistoryProps {
  invoice: Invoice;
  onRestoreVersion?: (version: number) => void;
}

export function InvoiceHistory({ invoice, onRestoreVersion }: InvoiceHistoryProps) {
  const getActionIcon = (action: HistoryEntry['action']) => {
    switch (action) {
      case 'created': return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'edited': return <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'sent': return <Send className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'paid': return <CreditCard className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'canceled': return <X className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case 'validated': return <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'duplicated': return <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
      default: return <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getActionColor = (action: HistoryEntry['action']) => {
    switch (action) {
      case 'created': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'edited': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'sent': return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      case 'paid': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'canceled': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'validated': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'duplicated': return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getActionLabel = (action: HistoryEntry['action']) => {
    switch (action) {
      case 'created': return 'Créé';
      case 'edited': return 'Modifié';
      case 'sent': return 'Envoyé';
      case 'paid': return 'Payé';
      case 'canceled': return 'Annulé';
      case 'validated': return 'Validé';
      case 'duplicated': return 'Dupliqué';
      default: return action;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const history = invoice.history || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
          <Clock className="w-6 h-6 mr-3 text-primary-600" />
          Historique du Document
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Version {invoice.version} • {history.length} entrées
        </div>
      </div>
      
      {history.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Aucun historique disponible</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((entry, index) => (
            <div 
              key={entry.id} 
              className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg group-hover:bg-primary-50 dark:group-hover:bg-primary-900 transition-colors duration-200">
                  {getActionIcon(entry.action)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${getActionColor(entry.action)}`}>
                        {getActionLabel(entry.action)}
                      </span>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <User className="w-4 h-4" />
                        <span>{entry.user}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(entry.timestamp)}
                      </span>
                      {onRestoreVersion && index < history.length - 1 && (
                        <button
                          onClick={() => onRestoreVersion(invoice.version - (history.length - index - 1))}
                          className="inline-flex items-center px-3 py-1 text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900 rounded-full hover:bg-primary-100 dark:hover:bg-primary-800 transition-all duration-200 transform hover:scale-105"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Restaurer
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {entry.changes && Object.keys(entry.changes).length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-3">
                      <div className="font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                        <Edit className="w-4 h-4 mr-2" />
                        Modifications détaillées:
                      </div>
                      <div className="space-y-2">
                        {Object.entries(entry.changes).map(([field, change]) => (
                          <div key={field} className="text-sm">
                            <span className="font-medium text-gray-600 dark:text-gray-400 capitalize">
                              {field.replace('_', ' ')}:
                            </span>
                            <div className="ml-4 flex items-center space-x-2">
                              <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded text-xs line-through">
                                {String(change.old)}
                              </span>
                              <span className="text-gray-400">→</span>
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-xs">
                                {String(change.new)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {entry.notes && (
                    <div className="bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-400 p-3 rounded">
                      <p className="text-sm text-blue-700 dark:text-blue-300 italic">
                        "{entry.notes}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}