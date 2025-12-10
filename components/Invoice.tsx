"use client";

import React, { useEffect, useState } from "react";
import { Download, Printer, Loader2 } from "lucide-react";
import { downloadInvoice, getInvoiceHTML } from "@/app/utils/api";
import { Button } from "@/components/ui/Button";

interface InvoiceProps {
  orderId: string;
  orderType?: "regular" | "fish";
  onClose?: () => void;
}

export default function Invoice({ orderId, orderType = "regular", onClose }: InvoiceProps) {
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        setError(null);
        const invoiceHtml = await getInvoiceHTML(orderId, orderType);
        setHtml(invoiceHtml);
      } catch (err: any) {
        setError(err.message || "Failed to load invoice");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchInvoice();
    }
  }, [orderId, orderType]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadInvoice(orderId, orderType);
    } catch (err: any) {
      alert(err.message || "Failed to download invoice");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-green)] mx-auto mb-4" />
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          {onClose && (
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Action Buttons */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Button
            onClick={handleDownload}
            disabled={downloading}
            isLoading={downloading}
            variant="primary"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={handlePrint} variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
        {onClose && (
          <Button onClick={onClose} variant="ghost">
            Close
          </Button>
        )}
      </div>

      {/* Invoice Content */}
      <div
        className="invoice-content print:block"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .invoice-content,
          .invoice-content * {
            visibility: visible;
          }
          .invoice-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

