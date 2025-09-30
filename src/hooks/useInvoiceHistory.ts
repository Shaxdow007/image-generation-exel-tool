import { useState, useCallback } from 'react';
import { Invoice, HistoryEntry } from '../types/invoice';

export function useInvoiceHistory() {
  const addHistoryEntry = useCallback((
    invoice: Invoice,
    action: HistoryEntry['action'],
    changes?: Record<string, { old: any; new: any }>,
    notes?: string
  ): Invoice => {
    const historyEntry: HistoryEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      user: 'Current User', // In a real app, this would come from auth
      action,
      changes,
      notes,
    };

    return {
      ...invoice,
      history: [...(invoice.history || []), historyEntry],
      updatedAt: new Date().toISOString(),
      version: invoice.version + 1,
    };
  }, []);

  const getDiff = useCallback((oldInvoice: Invoice, newInvoice: Invoice) => {
    const changes: Record<string, { old: any; new: any }> = {};
    
    // Compare basic fields
    const fieldsToCompare = ['number', 'date', 'reference', 'vendor', 'advance', 'status'];
    fieldsToCompare.forEach(field => {
      if (oldInvoice[field as keyof Invoice] !== newInvoice[field as keyof Invoice]) {
        changes[field] = {
          old: oldInvoice[field as keyof Invoice],
          new: newInvoice[field as keyof Invoice],
        };
      }
    });

    // Compare client info
    Object.keys(oldInvoice.client).forEach(key => {
      const clientKey = key as keyof typeof oldInvoice.client;
      if (oldInvoice.client[clientKey] !== newInvoice.client[clientKey]) {
        changes[`client.${key}`] = {
          old: oldInvoice.client[clientKey],
          new: newInvoice.client[clientKey],
        };
      }
    });

    // Compare items (simplified)
    if (JSON.stringify(oldInvoice.items) !== JSON.stringify(newInvoice.items)) {
      changes.items = {
        old: `${oldInvoice.items.length} items`,
        new: `${newInvoice.items.length} items`,
      };
    }

    return changes;
  }, []);

  return { addHistoryEntry, getDiff };
}