'use client';

import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CustomerAccount } from '@/types/customer';
import { LedgerTransaction } from '@/data/customerData';

interface CustomerPdfExportProps {
    customers: CustomerAccount[];
    transactions: LedgerTransaction[];
}

export default function CustomerPdfExport({ transactions }: CustomerPdfExportProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePdf = () => {
        try {
            setIsGenerating(true);
            const doc = new jsPDF();

            // --- 1. Top Header Section (100% English for safe font rendering) ---
            doc.setFontSize(14);
            doc.setTextColor(30, 30, 30);
            doc.text('Al-Rahman Company', 14, 15);

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
            let runningBalance = 0;
            let totalCredit = 0;
            let totalDebit = 0;
            let activeCurrency = 'AFN';

            const headers = [['No', 'Date', 'Description', 'Credit (+)', 'Debit (-)', 'Balance']];

            const rows = transactions.map((t, index) => {
                const serialNo = t.refNo || String(index + 1);
                const dateStr = t.date || new Date().toISOString().slice(0, 10);
                const amountVal = Number(t.amount) || 0;
                const currency = (t.currency || 'AFN').toUpperCase();
                activeCurrency = currency; // Track currency for footer summary

                const description = `${t.title || ''} ${t.tag ? `(${t.tag})` : ''}`;

                let creditStr = '-';
                let debitStr = '-';

                if (t.isCredit) {
                    runningBalance += amountVal;
                    totalCredit += amountVal;
                    creditStr = `${amountVal.toLocaleString()} ${currency}`;
                } else {
                    runningBalance -= amountVal;
                    totalDebit += amountVal;
                    debitStr = `${amountVal.toLocaleString()} ${currency}`;
                }

                const balanceDisplay = `${runningBalance.toLocaleString()} ${currency}`;

                return [
                    serialNo,
                    dateStr,
                    description || '-',
                    creditStr,
                    debitStr,
                    balanceDisplay,
                ];
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
                    0: { cellWidth: 14 },
                    1: { cellWidth: 25 },
                    2: { cellWidth: 54 },
                    3: { cellWidth: 29, halign: 'right' },
                    4: { cellWidth: 29, halign: 'right' },
                    5: { cellWidth: 31, halign: 'right' },
                },
                didParseCell: (data) => {
                    if (data.section === 'head' && data.column.index === 4) {
                        data.cell.styles.fillColor = [220, 38, 38];
                    }

                    if (data.section !== 'body') return;

                    if (data.column.index === 3) {
                        data.cell.styles.textColor = [5, 150, 105];
                    } else if (data.column.index === 4) {
                        data.cell.styles.textColor = [220, 38, 38];
                    }
                },
            });

            const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

            // --- 5. Summary Footer Cards with Currencies ---
            doc.setFillColor(245, 247, 250);
            doc.roundedRect(14, finalY, 182, 16, 2, 2, 'F');

            doc.setFontSize(8);
            doc.setTextColor(50, 50, 50);
            doc.text(`Total Transactions: ${transactions.length}`, 18, finalY + 6);
            doc.text(`Total Credit (+): ${totalCredit.toLocaleString()} ${activeCurrency}`, 70, finalY + 6);
            doc.text(`Total Debit (-): ${totalDebit.toLocaleString()} ${activeCurrency}`, 125, finalY + 6);

            doc.setFontSize(9);
            doc.setTextColor(16, 185, 129);
            doc.text(`Net Balance: ${runningBalance.toLocaleString()} ${activeCurrency}`, 18, finalY + 12);

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