'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ReferralRow = {
  id: string;
  candidate_email: string | null;
  status: 'submitted' | 'reviewed' | 'shortlisted' | 'hired' | 'rejected' | string | null;
  ai_match_score: number | null;
  created_at: string | null;
  job?: { id: string; title: string | null; subscription_tier?: string | null; salary_min?: number | null; salary_max?: number | null } | null;
};

function estimatePlacementFee(min?: number | null, max?: number | null) {
  const a = Number(min ?? 0) || 0;
  const b = Number(max ?? 0) || a;
  const avg = a && b ? (a + b) / 2 : a || b || 0;
  return avg * 0.20; // 20% fee
}

function fmtCurrency(n: number) {
  try { return `$${Math.round(n).toLocaleString()}`; } catch { return `$${n}`; }
}

export function MyReferralsClient({ initialReferrals, earningsShare = 0.40 }: { initialReferrals: ReferralRow[]; earningsShare?: number }) {
  const [status, setStatus] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [jobType, setJobType] = useState<string>('all');
  const [minMatch, setMinMatch] = useState<string>('');
  const [titleSearch, setTitleSearch] = useState<string>('');

  const filtered = useMemo(() => {
    const minMatchNum = Number(minMatch);
    return (initialReferrals || []).filter(r => {
      if (status !== 'all' && r.status !== status) return false;
      if (jobType !== 'all' && (r.job?.subscription_tier || 'unknown') !== jobType) return false;
      if (titleSearch && !(r.job?.title || '').toLowerCase().includes(titleSearch.toLowerCase())) return false;
      if (startDate) {
        const d = r.created_at ? new Date(r.created_at) : null;
        if (!d || d < new Date(startDate)) return false;
      }
      if (endDate) {
        const d = r.created_at ? new Date(r.created_at) : null;
        if (!d || d > new Date(endDate)) return false;
      }
      if (!Number.isNaN(minMatchNum) && minMatch !== '' && (Number(r.ai_match_score || 0) < minMatchNum)) return false;
      return true;
    });
  }, [initialReferrals, status, jobType, startDate, endDate, minMatch, titleSearch]);

  return (
    <Card>
      <CardHeader><CardTitle>My Referral Submissions</CardTitle></CardHeader>
      <CardContent>
        <div className="grid gap-2 mb-4 md:grid-cols-5">
          <Select value={status} onValueChange={setStatus as any}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="shortlisted">Shortlisted</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} placeholder="Start" />
          <Input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} placeholder="End" />
          <Select value={jobType} onValueChange={setJobType as any}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Job type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Job Tiers</SelectItem>
              <SelectItem value="connect">Connect</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="exclusive">Exclusive</SelectItem>
            </SelectContent>
          </Select>
          <Input type="number" min={0} max={100} value={minMatch} onChange={e=>setMinMatch(e.target.value)} placeholder="Min match %" />
        </div>

        <div className="mb-3">
          <Input placeholder="Search job title" value={titleSearch} onChange={e=>setTitleSearch(e.target.value)} />
        </div>

        {filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground">No referrals match your filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Candidate</th>
                  <th className="py-2 pr-4">Job</th>
                  <th className="py-2 pr-4">Tier</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Match</th>
                  <th className="py-2 pr-4">Est. Earnings</th>
                  <th className="py-2 pr-4">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const job = r.job || null;
                  const fee = estimatePlacementFee(job?.salary_min, job?.salary_max);
                  const est = r.status === 'hired' ? fee * earningsShare : 0;
                  return (
                    <tr key={r.id} className="border-b last:border-none">
                      <td className="py-2 pr-4">{r.candidate_email || '—'}</td>
                      <td className="py-2 pr-4">{job?.title || '—'}</td>
                      <td className="py-2 pr-4 capitalize">{job?.subscription_tier || '—'}</td>
                      <td className="py-2 pr-4 capitalize">{r.status || '—'}</td>
                      <td className="py-2 pr-4">{typeof r.ai_match_score === 'number' ? `${Math.round(r.ai_match_score)}%` : '—'}</td>
                      <td className="py-2 pr-4 text-green-700">{fmtCurrency(est)}</td>
                      <td className="py-2 pr-4">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}




