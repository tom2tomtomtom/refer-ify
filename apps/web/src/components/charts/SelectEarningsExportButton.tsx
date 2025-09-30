'use client';

import { Button } from '@/components/ui/button';

export function SelectEarningsExportButton({
  earningsSeries,
  payments,
}: {
  earningsSeries: { month: string; earnings: number }[];
  payments: { date: string; amount: number; status: string; jobTitle?: string }[];
}) {
  function toCSV(rows: string[][]) {
    return rows.map(r => r.map(v => `"${String(v ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
  }

  function download(name: string, content: string, type = 'text/csv') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleExport() {
    const monthsHeader = ['month','earnings_usd'];
    const monthsRows = [monthsHeader, ...earningsSeries.map(p => [p.month, String(Math.round(p.earnings))])];
    const payHeader = ['date','job_title','amount_usd','status'];
    const payRows = [payHeader, ...payments.map(p => [p.date || '', p.jobTitle || '', String(Math.round(p.amount || 0)), p.status || ''])];
    const csv = `Select Circle Earnings\n${toCSV(monthsRows)}\n\nPayments\n${toCSV(payRows)}`;
    download('select-circle-earnings.csv', csv);
  }

  return (
    <Button onClick={handleExport} variant="outline">Export CSV</Button>
  );
}




