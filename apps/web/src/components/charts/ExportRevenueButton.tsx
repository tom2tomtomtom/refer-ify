'use client';

import { Button } from '@/components/ui/button';

type RevenuePoint = {
  month: string;
  network_revenue: number;
  direct_referrals: number;
  advisory_revenue: number;
};

type Session = {
  session_date?: string;
  duration_hours?: number;
  hourly_rate?: number;
  notes?: string | null;
};

export function ExportRevenueButton({
  revenueSeries,
  sessions,
}: {
  revenueSeries: RevenuePoint[];
  sessions: Session[];
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
    const revHeader = ['month','network_revenue','direct_referrals','advisory_revenue'];
    const revRows = [revHeader, ...revenueSeries.map(p => [p.month, String(p.network_revenue), String(p.direct_referrals), String(p.advisory_revenue)])];
    const sesHeader = ['session_date','duration_hours','hourly_rate','notes'];
    const sesRows = [sesHeader, ...sessions.map(s => [s.session_date || '', String(s.duration_hours ?? ''), String(s.hourly_rate ?? ''), s.notes ?? ''])];
    const csv = `Revenue\n${toCSV(revRows)}\n\nAdvisory Sessions\n${toCSV(sesRows)}`;
    download('founding-revenue.csv', csv);
  }

  return (
    <Button onClick={handleExport} variant="outline">Export CSV</Button>
  );
}


