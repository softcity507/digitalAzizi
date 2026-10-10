'use client';

import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { CustomerAccount, CustomerTransaction } from '@/types/customer';

interface CustomerPdfExportProps {
    businessName: string;
    customers: CustomerAccount[];
    transactions: CustomerTransaction[];
}

export default function CustomerPdfExport({ businessName, customers, transactions }: CustomerPdfExportProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePdf = () => {
        try {
            setIsGenerating(true);
            const doc = new jsPDF();

            // --- 1. Top Header Section (100% English for safe font rendering) ---
            doc.setFontSize(14);
            doc.setTextColor(30, 30, 30);
            doc.text(businessName || 'Business', 14, 15);

            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text('LEDGER ACCOUNT STATEMENT', 14, 21);

            // Top Right Statement Box
            doc.setFillColor(240, 243, 246);
            doc.rect(140, 10, 56, 16, 'F');
            doc.setFontSize(8);
            doc.setTextColor(80, 80, 80);
            doc.text('STATEMENT DATE', 143, 15);
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(new Date().toISOString().slice(0, 10), 143, 22);

            // --- 3. Calculations & Rows Mapping ---
            const balancesByCurrency = new Map<string, number>();
            const currentBalancesByCurrency = new Map<string, number>();
            const totalsByCurrency = new Map<string, { credit: number; debit: number }>();
            const transactionNetByCurrency = new Map<string, number>();
            const customerNames = new Map(customers.map((customer) => [customer.id, customer.name]));

            customers.forEach((customer) => {
                customer.balances.forEach((balance) => {
                    const currency = balance.currency.toUpperCase();
                    if (!totalsByCurrency.has(currency)) totalsByCurrency.set(currency, { credit: 0, debit: 0 });
                    const amount = Number(balance.amount.replaceAll(',', '').replace(/[^\d.-]/g, '')) || 0;
                    currentBalancesByCurrency.set(currency, (currentBalancesByCurrency.get(currency) ?? 0) + amount);
                });
            });

            const headers = [['No', 'Date', 'Customer', 'Description', 'Currency', 'Credit (+)', 'Debit (-)', 'Balance']];

            const rows = transactions.map((t, index) => {
                const serialNo = t.refNo || String(index + 1);
                const dateStr = t.date || new Date().toISOString().slice(0, 10);
                const amountVal = Number(t.amount) || 0;
                const currency = (t.currency || 'AFN').toUpperCase();
                const currentBalance = balancesByCurrency.get(currency) ?? 0;
                const totals = totalsByCurrency.get(currency) ?? { credit: 0, debit: 0 };

                const description = `${t.title || ''} ${t.tag ? `(${t.tag})` : ''}`;

                let creditStr = '-';
                let debitStr = '-';

                if (t.category !== 'initial' && t.isCredit) {
                    balancesByCurrency.set(currency, currentBalance + amountVal);
                    totals.credit += amountVal;
                    transactionNetByCurrency.set(currency, (transactionNetByCurrency.get(currency) ?? 0) + amountVal);
                    creditStr = `${amountVal.toLocaleString()} ${currency}`;
                } else if (t.category !== 'initial') {
                    balancesByCurrency.set(currency, currentBalance - amountVal);
                    totals.debit += amountVal;
                    transactionNetByCurrency.set(currency, (transactionNetByCurrency.get(currency) ?? 0) - amountVal);
                    debitStr = `${amountVal.toLocaleString()} ${currency}`;
                }
                totalsByCurrency.set(currency, totals);

                const balanceDisplay = `${(balancesByCurrency.get(currency) ?? 0).toLocaleString()} ${currency}`;

                return [
                    serialNo,
                    dateStr,
                    customerNames.get(t.customerId) || 'Unknown customer',
                    description || '-',
                    currency,
                    creditStr,
                    debitStr,
                    balanceDisplay,
                ];
            });

            // Reconcile transaction totals with each customer's current balance so
            // opening balances are included in the same per-currency summary.
            currentBalancesByCurrency.forEach((currentNet, currency) => {
                const totals = totalsByCurrency.get(currency) ?? { credit: 0, debit: 0 };
                const openingNet = currentNet - (transactionNetByCurrency.get(currency) ?? 0);
                if (openingNet >= 0) totals.credit += openingNet;
                else totals.debit += Math.abs(openingNet);
                totalsByCurrency.set(currency, totals);
            });

            // --- 4. Table Generation using autoTable ---
            autoTable(doc, {
                startY: 32,
                head: headers,
                body: rows,
                theme: 'grid',
                headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 8 },
                styles: { fontSize: 7.5, cellPadding: 2.5 },
                columnStyles: {
                    0: { cellWidth: 10 },
                    1: { cellWidth: 20 },
                    2: { cellWidth: 28 },
                    3: { cellWidth: 35 },
                    4: { cellWidth: 15 },
                    5: { cellWidth: 23, halign: 'right' },
                    6: { cellWidth: 23, halign: 'right' },
                    7: { cellWidth: 28, halign: 'right' },
                },
                didParseCell: (data) => {
                    if (data.section === 'head' && data.column.index === 6) {
                        data.cell.styles.fillColor = [220, 38, 38];
                    }

                    if (data.section !== 'body') return;

                    if (data.column.index === 3) {
                        data.cell.styles.textColor = [5, 150, 105];
                    } else if (data.column.index === 6) {
                        data.cell.styles.textColor = [220, 38, 38];
                    }
                },
            });

            const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

            // --- 5. Per-currency credit, debit, and net totals ---
            autoTable(doc, {
                startY: finalY,
                head: [['Currency', 'Total Credit (+)', 'Total Debit (-)', 'Net Balance']],
                body: [...totalsByCurrency.entries()].map(([currency, totals]) => [
                    currency,
                    `${totals.credit.toLocaleString()} ${currency}`,
                    `${totals.debit.toLocaleString()} ${currency}`,
                    `${(totals.credit - totals.debit).toLocaleString()} ${currency}`,
                ]),
                foot: [[`Transactions: ${transactions.length}`, '', '', '']],
                theme: 'grid',
                headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 8 },
                styles: { fontSize: 8, cellPadding: 2.5 },
                columnStyles: {
                    1: { halign: 'right' },
                    2: { halign: 'right' },
                    3: { halign: 'right' },
                },
            });

            // Save PDF file
            doc.save(`customer-ledger-statement-${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <button
            onClick={generatePdf}
            disabled={isGenerating}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm rounded-xl shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {isGenerating ? 'Generating PDF...' : 'Download Full Report (PDF)'}
        </button>
    );
}
