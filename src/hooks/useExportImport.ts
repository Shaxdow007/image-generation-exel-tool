import { useCallback } from 'react';
import { Invoice, ClientInfo, InvoiceItem, ExportOptions, ImportData } from '../types/invoice';

export function useExportImport() {
  const exportToPDF = useCallback((invoice: Invoice) => {
    // Trigger print which will use the print styles
    window.print();
  }, []);

  const exportToCSV = useCallback((invoices: Invoice[]) => {
    const headers = [
      'Number', 'Date', 'Client', 'Total HT', 'Total TTC', 'Status', 'Vendor'
    ];
    
    const rows = invoices.map(invoice => [
      invoice.number,
      invoice.date,
      invoice.client.name,
      (invoice.subtotal || 0).toFixed(2),
      (invoice.totalTtc || 0).toFixed(2),
      invoice.status,
      invoice.vendor
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const exportToJSON = useCallback((data: any, filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const importFromCSV = useCallback((file: File): Promise<ImportData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;
          const lines = csv.split('\n').filter(line => line.trim());
          
          if (lines.length === 0) {
            reject(new Error('Fichier CSV vide'));
            return;
          }

          const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
          const data: ImportData = {};

          // Detect data type based on headers
          if (headers.includes('Name') && headers.includes('Code')) {
            // Client data
            data.clients = lines.slice(1).map(line => {
              const values = line.split(',').map(v => v.replace(/"/g, '').trim());
              const client: any = { id: Date.now().toString() + Math.random() };
              
              headers.forEach((header, index) => {
                const value = values[index] || '';
                switch (header.toLowerCase()) {
                  case 'name': client.name = value; break;
                  case 'code': client.code = value; break;
                  case 'ice': client.ice = value; break;
                  case 'rc': client.rc = value; break;
                  case 'phone': client.phone = value; break;
                  case 'email': client.email = value; break;
                  case 'address': client.address = value; break;
                  case 'city': client.city = value; break;
                  case 'country': client.country = value; break;
                }
              });
              
              return client;
            }).filter(client => client.name && client.code);
          } 
          else if (headers.includes('Reference') && headers.includes('Designation')) {
            // Item data
            data.items = lines.slice(1).map(line => {
              const values = line.split(',').map(v => v.replace(/"/g, '').trim());
              const item: any = { id: Date.now().toString() + Math.random() };
              
              headers.forEach((header, index) => {
                const value = values[index] || '';
                switch (header.toLowerCase()) {
                  case 'reference': item.reference = value; break;
                  case 'designation': item.designation = value; break;
                  case 'unit': item.unit = value || 'U'; break;
                  case 'unitprice': item.unitPrice = parseFloat(value) || 0; break;
                  case 'tvarate': item.tvaRate = parseFloat(value) || 20; break;
                  case 'quantity': item.quantity = parseFloat(value) || 1; break;
                }
              });
              
              item.amount = (item.quantity || 1) * (item.unitPrice || 0);
              item.discount = 0;
              
              return item;
            }).filter(item => item.reference && item.designation);
          }
          else if (headers.includes('Number') && headers.includes('Date')) {
            // Invoice data
            data.invoices = lines.slice(1).map(line => {
              const values = line.split(',').map(v => v.replace(/"/g, '').trim());
              const invoice: any = { 
                id: Date.now().toString() + Math.random(),
                items: [],
                history: []
              };
              
              headers.forEach((header, index) => {
                const value = values[index] || '';
                switch (header.toLowerCase()) {
                  case 'number': invoice.number = value; break;
                  case 'date': invoice.date = value; break;
                  case 'clientcode': 
                    invoice.client = { 
                      id: Date.now().toString(),
                      code: value, 
                      name: value 
                    }; 
                    break;
                  case 'vendor': invoice.vendor = value; break;
                  case 'reference': invoice.reference = value; break;
                  case 'status': invoice.status = value || 'draft'; break;
                }
              });
              
              // Set default values
              invoice.subtotal = 0;
              invoice.totalTva = 0;
              invoice.totalTtc = 0;
              invoice.advance = 0;
              invoice.netToPay = 0;
              invoice.totalQuantity = 0;
              invoice.currency = 'MAD';
              invoice.globalDiscount = 0;
              invoice.tvaMode = 'exclusive';
              invoice.payments = [];
              invoice.createdAt = new Date().toISOString();
              invoice.updatedAt = new Date().toISOString();
              invoice.version = 1;
              
              return invoice;
            }).filter(invoice => invoice.number && invoice.date);
          }

          resolve(data);
        } catch (error) {
          reject(new Error('Erreur lors de l\'analyse du fichier CSV'));
        }
      };
      
      reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
      reader.readAsText(file, 'utf-8');
    });
  }, []);

  const createBackup = useCallback((invoices: Invoice[], clients: ClientInfo[]) => {
    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: {
        invoices,
        clients,
      }
    };
    
    exportToJSON(backup, `backup_${new Date().toISOString().split('T')[0]}.json`);
  }, [exportToJSON]);

  return {
    exportToPDF,
    exportToCSV,
    exportToJSON,
    importFromCSV,
    createBackup,
  };
}