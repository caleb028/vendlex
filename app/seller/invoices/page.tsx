"use client";

import React, { useState } from "react";
import { formatKSh } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { FileText, Plus, Printer, Download, Search, CheckCircle2, ShieldCheck } from "lucide-react";

interface InvoiceItem {
  description: string;
  qty: number;
  unitPrice: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  kraPin?: string;
  items: InvoiceItem[];
  subtotal: number;
  vatAmount: number;
  discount: number;
  total: number;
  status: "PAID" | "UNPAID";
  date: string;
  dueDate: string;
}

const SAMPLE_INVOICES: Invoice[] = [
  {
    id: "inv-1",
    invoiceNumber: "INV-2026-0841",
    customerName: "Safaricom Innovation Hub (Karen)",
    customerPhone: "+254 700 111 222",
    customerEmail: "procurement@safaricom.co.ke",
    kraPin: "P051298412Z",
    items: [
      { description: "Samsung Galaxy S24 Ultra (512GB Enterprise Units)", qty: 2, unitPrice: 154999 },
      { description: "MacBook Pro 14 M3 Pro Developer Spec", qty: 1, unitPrice: 279999 },
    ],
    subtotal: 589997,
    vatAmount: 94399.52,
    discount: 15000,
    total: 669396.52,
    status: "PAID",
    date: "2026-08-28",
    dueDate: "2026-09-10",
  },
  {
    id: "inv-2",
    invoiceNumber: "INV-2026-0839",
    customerName: "Amani Studios Westlands",
    customerPhone: "+254 722 334 455",
    customerEmail: "accounts@amanistudios.ke",
    kraPin: "P051982144K",
    items: [
      { description: "Sony Bravia 55-inch 4K HDR Smart Google TV", qty: 2, unitPrice: 68999 },
    ],
    subtotal: 137998,
    vatAmount: 22079.68,
    discount: 0,
    total: 160077.68,
    status: "UNPAID",
    date: "2026-08-29",
    dueDate: "2026-09-15",
  },
];

export default function SellerInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(SAMPLE_INVOICES);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(SAMPLE_INVOICES[0]);
  const [modalOpen, setModalOpen] = useState(false);

  // New invoice form
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [custKra, setCustKra] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemQty, setItemQty] = useState("1");
  const [itemPrice, setItemPrice] = useState("");

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(itemQty) || 1;
    const price = parseFloat(itemPrice) || 5000;
    const sub = qty * price;
    const vat = sub * 0.16;
    const tot = sub + vat;

    const newInv: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: custName,
      customerPhone: custPhone,
      customerEmail: custEmail,
      kraPin: custKra || undefined,
      items: [{ description: itemDesc, qty, unitPrice: price }],
      subtotal: sub,
      vatAmount: vat,
      discount: 0,
      total: tot,
      status: "UNPAID",
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    };

    setInvoices([newInv, ...invoices]);
    setSelectedInvoice(newInv);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">Invoices & KRA Receipts</h1>
          <p className="text-xs text-muted-foreground">Generate official KRA VAT-ready business invoices for corporate and retail customers.</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Invoice</span>
        </button>
      </div>

      {/* Invoice List & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Invoices List (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-5 shadow-sm space-y-3">
          <h3 className="font-extrabold text-sm text-foreground border-b border-border pb-3">
            Generated Invoices ({invoices.length})
          </h3>

          <div className="space-y-2">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                onClick={() => setSelectedInvoice(inv)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  selectedInvoice?.id === inv.id
                    ? "border-brand-emerald bg-brand-emerald-soft/40 dark:bg-brand-dark-bg"
                    : "border-border hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono font-bold text-foreground">{inv.invoiceNumber}</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    inv.status === "PAID"
                      ? "bg-emerald-100 text-brand-emerald"
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    {inv.status}
                  </span>
                </div>
                <div className="font-semibold text-xs text-foreground truncate">{inv.customerName}</div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
                  <span>{inv.date}</span>
                  <span className="font-black text-brand-emerald">{formatKSh(inv.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Printable Official Invoice Preview (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          {selectedInvoice ? (
            <div id="printable-invoice" className="space-y-6">
              {/* Top Controls */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <span className="text-xs font-bold text-muted-foreground">
                  Invoice Preview: {selectedInvoice.invoiceNumber}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 text-xs font-bold text-foreground hover:bg-muted px-3 py-1.5 rounded-xl border border-border transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                  <a
                    href="/api/documents/VLX-INV-2026-000104/download"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs font-bold bg-brand-emerald text-white px-3 py-1.5 rounded-xl shadow-sm hover:bg-brand-emerald-dark transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </a>
                </div>
              </div>

              {/* Official Invoice Sheet */}
              <div className="p-6 rounded-2xl bg-muted/10 border border-border space-y-6 text-xs">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-border pb-4">
                  <div>
                    <div className="bg-white p-2 rounded-xl inline-block shadow-sm mb-2 border border-gray-200">
                      <img src="/logo/vendlex-logo.png" alt="VendLex" className="h-14 sm:h-16 w-auto max-w-[280px] object-contain" />
                    </div>
                    <h4 className="font-extrabold text-sm text-foreground">Nairobi Tech Hub</h4>
                    <p className="text-muted-foreground text-[11px]">Bazaar Plaza 4th Floor, Moi Ave, Nairobi</p>
                    <p className="text-muted-foreground text-[11px]">KRA PIN: P051892401K | +254 712 345 678</p>
                  </div>

                  <div className="text-right space-y-0.5">
                    <span className="text-base font-black text-foreground block uppercase tracking-wider">
                      TAX INVOICE
                    </span>
                    <span className="font-mono font-bold text-brand-emerald">{selectedInvoice.invoiceNumber}</span>
                    <p className="text-muted-foreground">Date: {selectedInvoice.date}</p>
                    <p className="text-muted-foreground">Due: {selectedInvoice.dueDate}</p>
                  </div>
                </div>

                {/* Bill To */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Bill To:</span>
                  <div className="font-bold text-foreground text-sm">{selectedInvoice.customerName}</div>
                  <div className="text-muted-foreground">{selectedInvoice.customerPhone} • {selectedInvoice.customerEmail}</div>
                  {selectedInvoice.kraPin && (
                    <div className="text-muted-foreground font-mono">Client KRA PIN: {selectedInvoice.kraPin}</div>
                  )}
                </div>

                {/* Line Items Table */}
                <div className="border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-muted/60 border-b border-border text-[10px] font-bold uppercase text-muted-foreground">
                      <tr>
                        <th className="p-2.5">Item Description</th>
                        <th className="p-2.5 text-center">Qty</th>
                        <th className="p-2.5 text-right">Unit Price</th>
                        <th className="p-2.5 text-right">Total (KSh)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {selectedInvoice.items.map((it, i) => (
                        <tr key={i}>
                          <td className="p-2.5 font-semibold text-foreground">{it.description}</td>
                          <td className="p-2.5 text-center">{it.qty}</td>
                          <td className="p-2.5 text-right">{formatKSh(it.unitPrice)}</td>
                          <td className="p-2.5 text-right font-bold text-foreground">{formatKSh(it.unitPrice * it.qty)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Subtotals & VAT */}
                <div className="flex justify-end pt-2">
                  <div className="w-64 space-y-1.5 text-right">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal:</span>
                      <span className="font-semibold text-foreground">{formatKSh(selectedInvoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>VAT (16% Standard):</span>
                      <span className="font-semibold text-foreground">{formatKSh(Math.round(selectedInvoice.vatAmount))}</span>
                    </div>
                    <div className="border-t border-border pt-1.5 flex justify-between font-bold text-sm text-foreground">
                      <span>Total Amount:</span>
                      <span className="text-brand-emerald font-black text-base">{formatKSh(Math.round(selectedInvoice.total))}</span>
                    </div>
                  </div>
                </div>

                {/* Payment info */}
                <div className="pt-4 border-t border-border text-[10px] text-muted-foreground space-y-1">
                  <p className="font-bold text-foreground">Payment Settlement Instructions:</p>
                  <p>Lipa na M-Pesa Buy Goods Till: <strong className="font-mono text-foreground">894120 (Nairobi Tech Hub)</strong> or Paybill 400200 Acc: INV-8941.</p>
                  <p>Generated automatically via VendLex Kenya Business Invoicing Suite.</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Create Invoice Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Generate Client Invoice">
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Customer / Company Name *</label>
            <input
              type="text"
              required
              value={custName}
              onChange={(e) => setCustName(e.target.value)}
              placeholder="e.g. Safaricom Hub"
              className="w-full bg-muted/40 border rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={custPhone}
                onChange={(e) => setCustPhone(e.target.value)}
                placeholder="+254 7XX XXX XXX"
                className="w-full bg-muted/40 border rounded-xl p-2.5 text-xs text-foreground font-mono focus:outline-none focus:border-brand-emerald"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Customer KRA PIN (Optional)</label>
              <input
                type="text"
                value={custKra}
                onChange={(e) => setCustKra(e.target.value)}
                placeholder="P051XXXXXX"
                className="w-full bg-muted/40 border rounded-xl p-2.5 text-xs text-foreground font-mono uppercase focus:outline-none focus:border-brand-emerald"
              />
            </div>
          </div>

          <div className="border-t border-border pt-3 space-y-3">
            <h4 className="font-bold text-xs text-foreground">Invoice Item</h4>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Item / Service Description *</label>
              <input
                type="text"
                required
                value={itemDesc}
                onChange={(e) => setItemDesc(e.target.value)}
                placeholder="e.g. 5x HP Laptops + Deployment"
                className="w-full bg-muted/40 border rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Quantity *</label>
                <input
                  type="number"
                  required
                  value={itemQty}
                  onChange={(e) => setItemQty(e.target.value)}
                  className="w-full bg-muted/40 border rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Unit Price (KSh) *</label>
                <input
                  type="number"
                  required
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  placeholder="45000"
                  className="w-full bg-muted/40 border rounded-xl p-2.5 text-xs text-foreground font-bold focus:outline-none focus:border-brand-emerald"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold py-3 rounded-xl text-xs shadow-sm transition-all"
          >
            Generate Official Invoice
          </button>
        </form>
      </Modal>
    </div>
  );
}
