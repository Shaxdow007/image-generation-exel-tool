export interface InvoiceItem {
  id: string;
  reference: string;
  designation: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  tvaRate: number;
  discount: number;
}

export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  fax: string;
  ice: string;
  rc: string;
  logo?: string;
  rib?: string;
  stamp?: string;
  colorTheme: string;
  fontSize: number;
  headerText?: string;
  footerText?: string;
  watermark?: string;
}

export interface ClientInfo {
  id: string;
  code: string;
  name: string;
  address?: string;
  chantier?: string;
  mode?: string;
  ice?: string;
  rc?: string;
  phone?: string;
  email?: string;
  city?: string;
  country?: string;
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  method: 'Virement' | 'Espèces' | 'Chèque' | 'Carte' | 'Autre';
  reference?: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  user: string;
  action: 'created' | 'edited' | 'sent' | 'paid' | 'canceled' | 'validated' | 'duplicated';
  changes?: Record<string, { old: any; new: any }>;
  notes?: string;
}

export type InvoiceStatus = 'draft' | 'validated' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'canceled';

export interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate?: string;
  reference: string;
  vendor: string;
  client: ClientInfo;
  items: InvoiceItem[];
  subtotal: number;
  totalTva: number;
  totalTtc: number;
  advance: number;
  netToPay: number;
  totalQuantity: number;
  status: InvoiceStatus;
  currency: string;
  globalDiscount: number;
  tvaMode: 'inclusive' | 'exclusive';
  payments: Payment[];
  history: HistoryEntry[];
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface NumberingSequence {
  id: string;
  name: string;
  prefix: string;
  format: string; // e.g., "BLH-{YYYY}-{####}"
  currentNumber: number;
  isActive: boolean;
}

export interface Template {
  id: string;
  name: string;
  type: 'invoice' | 'quote' | 'delivery' | 'credit';
  companyInfo: CompanyInfo;
  defaultItems: InvoiceItem[];
  settings: {
    showLogo: boolean;
    showStamp: boolean;
    watermark?: string;
    colorTheme: string;
  };
}

export interface ExportOptions {
  format: 'pdf' | 'csv' | 'excel' | 'json';
  dateRange?: { start: string; end: string };
  status?: InvoiceStatus[];
  includeAttachments?: boolean;
}

export interface ImportData {
  clients?: ClientInfo[];
  items?: Omit<InvoiceItem, 'id' | 'amount'>[];
  invoices?: Partial<Invoice>[];
}