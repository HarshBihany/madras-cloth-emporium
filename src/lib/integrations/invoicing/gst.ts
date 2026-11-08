/**
 * GST INVOICING — integration point.
 *
 * Each product and order line already stores hsnCode + gstRatePct, and orders have invoiceNumber.
 * IMPORTANT: GST rates on textiles/apparel depend on HSN code and sometimes on the sale value
 * per piece, and rates change. Confirm the correct HSN code and rate for every product with
 * your Chartered Accountant before issuing tax invoices. Nothing here is tax advice.
 *
 * This module provides pure helpers (no I/O) to compute tax breakdowns from GST-INCLUSIVE prices,
 * plus an interface for a future invoice generator (PDF or e-invoicing via a GSP if turnover requires it).
 */

export type TaxLine = { description: string; hsnCode: string | null; quantity: number; unit: string; inclusiveTotalPaise: number; gstRatePct: number | null };

export type TaxBreakdown = {
  taxablePaise: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  totalPaise: number;
};

/**
 * Split a GST-inclusive amount into taxable value + tax.
 * Intra-state (seller and buyer both in Jharkhand) → CGST + SGST; inter-state → IGST.
 */
export function splitInclusive(inclusivePaise: number, ratePct: number, intraState: boolean): TaxBreakdown {
  const taxable = Math.round((inclusivePaise * 100) / (100 + ratePct));
  const tax = inclusivePaise - taxable;
  if (intraState) {
    const half = Math.floor(tax / 2);
    return { taxablePaise: taxable, cgstPaise: half, sgstPaise: tax - half, igstPaise: 0, totalPaise: inclusivePaise };
  }
  return { taxablePaise: taxable, cgstPaise: 0, sgstPaise: 0, igstPaise: tax, totalPaise: inclusivePaise };
}

export function invoiceTotals(lines: TaxLine[], buyerStateCode: string, sellerStateCode = "20" /* Jharkhand */) {
  const intra = buyerStateCode === sellerStateCode;
  const rows = lines.map((l) => ({ ...l, tax: l.gstRatePct == null ? null : splitInclusive(l.inclusiveTotalPaise, l.gstRatePct, intra) }));
  const missingRates = rows.filter((r) => r.tax == null).map((r) => r.description);
  return { intraState: intra, rows, missingRates };
}

export interface InvoiceGenerator {
  /** Allocate the next sequential invoice number (e.g. MCE/2026-27/0001) and render a PDF. */
  issue(orderId: string): Promise<{ invoiceNumber: string; pdfUrl: string }>;
}
