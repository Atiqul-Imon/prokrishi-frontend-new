"use client";

import React from "react";
import { Printer, Download } from "lucide-react";
import { formatCurrency, formatDateTimeBD } from "@/app/utils";
import type { Order } from "@/types/models";
import { Button } from "@/components/ui/Button";

interface OrderInvoiceProps {
  order: Order & { orderType?: "regular" | "fish" };
  onPrint?: () => void;
  onDownload?: () => void;
  showActions?: boolean;
}

export default function OrderInvoice({ order, onPrint, onDownload, showActions = true }: OrderInvoiceProps) {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleDownload = async () => {
    if (onDownload) {
      onDownload();
      return;
    }

    // Use browser's print to PDF functionality
    // This is the most reliable cross-browser solution
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to download the invoice");
      return;
    }

    const invoiceElement = document.querySelector('[data-invoice-content]') || document.querySelector('.bg-white.border');
    if (!invoiceElement) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoiceNumber}</title>
          <style>
            @page {
              size: A4;
              margin: 1cm;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            * {
              box-sizing: border-box;
            }
          </style>
        </head>
        <body>
          ${invoiceElement.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    setTimeout(() => {
      printWindow.print();
      // Close window after print dialog
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    }, 250);
  };

  const invoiceNumber = order.invoiceNumber || order._id?.slice(-8) || "N/A";
  const orderDate = formatDateTimeBD(order.createdAt);
  const customerName = order.user?.name || order.guestInfo?.name || order.shippingAddress?.name || "Guest";
  const customerEmail = order.user?.email || order.guestInfo?.email || "N/A";
  const customerPhone = order.user?.phone || order.guestInfo?.phone || order.shippingAddress?.phone || "N/A";
  const shippingAddress = order.shippingAddress;
  const isFishOrder = (order as any).orderType === "fish";

  // Calculate totals
  const subtotal = order.totalPrice || 0;
  const shippingFee = order.shippingFee || 0;
  const totalAmount = order.totalAmount || order.totalPrice || 0;

  return (
    <>
      {/* Print Actions - Hidden when printing */}
      {showActions && (
        <div className="mb-6 flex items-center justify-end gap-3 print:hidden">
          <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
            <Printer size={18} />
            Print Invoice
          </Button>
          <Button onClick={handleDownload} variant="primary" className="flex items-center gap-2">
            <Download size={18} />
            Download PDF
          </Button>
        </div>
      )}

      {/* Invoice Container */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm print:shadow-none print:border-0" data-invoice-content>
        <div className="p-8 print:p-6">
          {/* Header */}
          <div className="border-b-2 border-emerald-600 pb-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <img
                    src="/logo/prokrishihublogo.png"
                    alt="Prokrishi Hub Logo"
                    className="h-20 w-auto object-contain print:h-16"
                    onError={(e) => {
                      // Fallback if image fails to load
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-emerald-600 mb-2">Prokrishi Hub</h1>
                  <p className="text-sm text-gray-600">Your Trusted Online Grocery Store</p>
                  <div className="mt-4 text-sm text-gray-600 space-y-1">
                    <p>Email: support@prokrishihub.com</p>
                    <p>Phone: +880 1712-345678</p>
                    <p>Website: www.prokrishihub.com</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">INVOICE</h2>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-semibold">Invoice #:</span> {invoiceNumber}
                  </p>
                  <p>
                    <span className="font-semibold">Order Date:</span> {orderDate}
                  </p>
                  {order.status && (
                    <p>
                      <span className="font-semibold">Status:</span>{" "}
                      <span className="capitalize">{order.status}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                Bill To
              </h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-semibold">{customerName}</p>
                <p>{customerEmail}</p>
                <p>{customerPhone}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                Ship To
              </h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-semibold">{shippingAddress?.name || customerName}</p>
                <p>{shippingAddress?.address}</p>
                {shippingAddress?.upazila && (
                  <p>
                    {shippingAddress.upazila}
                    {shippingAddress.district && `, ${shippingAddress.district}`}
                    {shippingAddress.division && `, ${shippingAddress.division}`}
                  </p>
                )}
                {shippingAddress?.phone && <p>{shippingAddress.phone}</p>}
                {(shippingAddress as any)?.postalCode && <p>Postal Code: {(shippingAddress as any).postalCode}</p>}
              </div>
            </div>
          </div>

          {/* Order Items Table */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
              Order Items
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      #
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Item Description
                    </th>
                    {isFishOrder ? (
                      <>
                        <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-900">
                          Size
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-900">
                          Qty
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-900">
                          Weight (kg)
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-right text-sm font-semibold text-gray-900">
                          Price/kg
                        </th>
                      </>
                    ) : (
                      <>
                        <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-900">
                          Variant
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-900">
                          Qty
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-right text-sm font-semibold text-gray-900">
                          Unit Price
                        </th>
                      </>
                    )}
                    <th className="border border-gray-300 px-4 py-3 text-right text-sm font-semibold text-gray-900">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems?.map((item, index) => {
                    const itemName = item.name || "Product";
                    const variant = (item as any).variant;
                    const quantity = item.quantity || (item as any).quantity || 1;
                    const price = item.price || 0;
                    // For fish orders, use actualWeight or requestedWeight for weight calculation
                    const fishWeight = isFishOrder ? ((item as any).actualWeight || (item as any).requestedWeight || 0) : 0;
                    const total = isFishOrder && fishWeight > 0 
                      ? fishWeight * ((item as any).pricePerKg || variant?.pricePerKg || price)
                      : price * quantity;

                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                          {index + 1}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900 font-medium">
                          {itemName}
                        </td>
                        {isFishOrder ? (
                          <>
                            <td className="border border-gray-300 px-4 py-3 text-sm text-center text-gray-700">
                              {variant?.label || (item as any).sizeCategoryLabel || "N/A"}
                            </td>
                            <td className="border border-gray-300 px-4 py-3 text-sm text-center text-gray-700">
                              {quantity}
                            </td>
                            <td className="border border-gray-300 px-4 py-3 text-sm text-center text-gray-700">
                              {fishWeight > 0 ? fishWeight.toFixed(2) : "TBD"}
                            </td>
                            <td className="border border-gray-300 px-4 py-3 text-sm text-right text-gray-700">
                              {(item as any).pricePerKg || variant?.pricePerKg ? formatCurrency((item as any).pricePerKg || variant.pricePerKg) : "N/A"}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="border border-gray-300 px-4 py-3 text-sm text-center text-gray-700">
                              {variant?.label || "Standard"}
                            </td>
                            <td className="border border-gray-300 px-4 py-3 text-sm text-center text-gray-700">
                              {quantity}
                            </td>
                            <td className="border border-gray-300 px-4 py-3 text-sm text-right text-gray-700">
                              {formatCurrency(price / quantity)}
                            </td>
                          </>
                        )}
                        <td className="border border-gray-300 px-4 py-3 text-sm text-right text-gray-900 font-semibold">
                          {formatCurrency(total)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-full md:w-80 space-y-2">
              <div className="flex justify-between text-sm text-gray-700 border-b border-gray-200 pb-2">
                <span>Subtotal:</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              {shippingFee > 0 && (
                <div className="flex justify-between text-sm text-gray-700 border-b border-gray-200 pb-2">
                  <span>Shipping Fee:</span>
                  <span className="font-semibold">{formatCurrency(shippingFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t-2 border-emerald-600">
                <span>Total Amount:</span>
                <span className="text-emerald-600">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <span className="font-semibold">Payment Method:</span>{" "}
                <span className="capitalize">{order.paymentMethod || "Cash on Delivery"}</span>
              </div>
              <div>
                <span className="font-semibold">Payment Status:</span>{" "}
                <span className="capitalize">{order.paymentStatus || "Pending"}</span>
              </div>
              {order.transactionId && (
                <div>
                  <span className="font-semibold">Transaction ID:</span> {order.transactionId}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-emerald-600 pt-6 text-center text-sm text-gray-600">
            <p className="font-semibold text-gray-900 mb-2">Thank you for your business!</p>
            <p>This is a computer-generated invoice. No signature required.</p>
            <p className="mt-2">
              For any queries, please contact us at support@prokrishihub.com or call +880 1712-345678
            </p>
            <p className="mt-4 text-xs">
              Invoice generated on {new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })} (BDT)
            </p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 1.5cm;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          body * {
            visibility: hidden;
          }
          
          [data-invoice-content],
          [data-invoice-content] * {
            visibility: visible;
          }
          
          [data-invoice-content] {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          /* Hide action buttons when printing */
          .print\\:hidden {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* Ensure proper page breaks */
          table {
            page-break-inside: avoid;
          }
          
          tr {
            page-break-inside: avoid;
          }
          
          /* Hide navigation and other UI elements */
          nav,
          header,
          footer,
          aside,
          button {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* Print-friendly colors */
          .text-emerald-600 {
            color: #059669 !important;
          }
          
          .border-emerald-600 {
            border-color: #059669 !important;
          }
          
          /* Ensure logo prints correctly */
          img {
            max-width: 100%;
            height: auto;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
      `}</style>
    </>
  );
}

