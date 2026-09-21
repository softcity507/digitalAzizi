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

export default function CustomerPdfExport({ customers, transactions }: CustomerPdfExportProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePdf = () => {
        try {
            setIsGenerating(true);
            const doc = new jsPDF();

            // Title & Header info
            doc.setFontSize(18);
            doc.setTextColor(40, 40, 40);
            doc.text('Customer Ledger & Accounts Report', 14, 20);

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 28);

            // 1. Customers Table
            const customerHeaders = [['ID', 'Customer Name', 'Subtitle / Location', 'Phone', 'Balances']];
            const customerRows = customers.map((c) => [
                c.id,
                c.name,
                c.subtitle || '-',
                c.phone || '-',
                c.balances.map((b) => `${b.currency}: ${b.amount}`).join('\n'),
            ]);

            autoTable(doc, {
                startY: 35,
                head: customerHeaders,
                body: customerRows,
                theme: 'grid',
                headStyles: { fillColor: [41, 128, 185], textColor: 255 },
                styles: { fontSize: 9, cellPadding: 4 },
            });

            // 2. Transactions Table
            const docWithTable = doc as jsPDF & { lastAutoTable?: { finalY: number } };
            const finalY = docWithTable.lastAutoTable?.finalY || 40;

            doc.setFontSize(14);
            doc.setTextColor(40, 40, 40);
            doc.text('Recent Transactions History', 14, finalY + 12);

            const txHeaders = [['Ref No', 'Customer ID', 'Title', 'Category', 'Amount', 'Currency', 'Date']];
            const txRows = transactions.map((t) => [
                t.refNo,
                t.customerId,
                t.title,
                t.tag,
                `${t.isCredit ? '+' : '-'}${t.amount.toLocaleString()}`,
                t.currency,
                t.date,
            ]);

            autoTable(doc, {
                startY: finalY + 18,
                head: txHeaders,
                body: txRows,
                theme: 'striped',
                headStyles: { fillColor: [52, 73, 94], textColor: 255 },
                styles: { fontSize: 8, cellPadding: 3 },
            });

            // Save PDF
            doc.save(`customer-ledger-report-${new Date().toISOString().slice(0, 10)}.pdf`);
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