"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, Download, Check } from "lucide-react";

export function BulkUploadModal({
  isOpen,
  onClose,
  onBatchSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onBatchSuccess?: (count: number) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedCount, setParsedCount] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setIsParsing(true);
      setTimeout(() => {
        setIsParsing(false);
        setParsedCount(42); // Simulated 42 validated products from CSV
      }, 1000);
    }
  };

  const handleConfirmBatch = () => {
    if (parsedCount) {
      if (onBatchSuccess) onBatchSuccess(parsedCount);
      onClose();
      setFile(null);
      setParsedCount(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bulk Product Upload via CSV / Excel" maxWidth="lg">
      <div className="space-y-5">
        <div className="p-3 bg-muted/40 dark:bg-brand-dark-bg/60 rounded-xl text-xs space-y-1.5">
          <span className="font-bold text-foreground block">📄 Template CSV Formatting Rules:</span>
          <p className="text-muted-foreground leading-relaxed">
            CSV columns must match: <code className="bg-muted px-1 py-0.5 rounded font-mono text-brand-emerald">Title, Category, Price, Stock, SKU, Description, County</code>.
          </p>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              alert("Sample CSV Template downloaded: VendLex_Bulk_Products_Template.csv");
            }}
            className="text-brand-emerald font-bold hover:underline inline-flex items-center gap-1 text-[11px]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Sample CSV Template (.csv)</span>
          </a>
        </div>

        <div>
          <label htmlFor="csv-file-input" className="border-2 border-dashed border-border hover:border-brand-emerald bg-muted/20 hover:bg-muted/40 p-6 rounded-2xl cursor-pointer flex flex-col items-center justify-center text-center transition-all">
            <FileSpreadsheet className="w-10 h-10 text-brand-emerald mb-2" />
            <span className="text-xs font-bold text-foreground">
              {file ? file.name : "Select CSV / Excel spreadsheet file from device"}
            </span>
            <span className="text-[10px] text-muted-foreground mt-1">Supports .csv, .xlsx up to 50MB (Max 500 items per file)</span>
          </label>
          <input type="file" id="csv-file-input" accept=".csv, .xlsx" onChange={handleFileChange} className="hidden" />
        </div>

        {isParsing && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-2xl text-xs font-bold text-center">
            Analyzing spreadsheet rows &amp; validating SKUs...
          </div>
        )}

        {parsedCount && !isParsing && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-brand-emerald rounded-2xl text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Validation Passed: {parsedCount} Products Ready for Import</span>
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
              All 42 SKU codes, prices, and stock numbers are valid with zero formatting conflicts.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted rounded-xl">
            Cancel
          </button>
          <button
            onClick={handleConfirmBatch}
            disabled={!parsedCount}
            className="bg-brand-emerald hover:bg-brand-emerald-dark disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-sm transition-all"
          >
            Publish All {parsedCount ? `${parsedCount} Listings` : "Products"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
