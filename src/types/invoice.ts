export interface InvoiceItem {
  id: string;
  reference: string;
  designation: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
}

export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  fax: string;
  ice: string;
  rc: string;
}

export interface ClientInfo {
  code: string;
  name: string;
  address?: string;
}

export interface Invoice {
  number: string;
  date: string;
  reference: string;
  vendor: string;
  client: ClientInfo;
  items: InvoiceItem[];
  subtotal: number;
  advance: number;
  netToPay: number;
  totalQuantity: number;
}