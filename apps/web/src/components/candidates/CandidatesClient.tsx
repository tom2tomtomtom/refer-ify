'use client';

import { useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

type Candidate = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  current_company: string | null;
  current_title: string | null;
  years_experience: number | null;
  location: string | null;
  work_authorization: string | null;
  created_at: string;
};

export function CandidatesClient({ initialCandidates }: { initialCandidates: Candidate[] }) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [workAuth, setWorkAuth] = useState<string | 'all'>('all');
  const [availability, setAvailability] = useState<string | 'all'>('all');

  async function fetchFiltered() {
    setLoading(true);
    try {
      let query = supabase.from('candidates').select('*').order('created_at', { ascending: false }).limit(100);
      if (search) {
        // simple OR search across common fields
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,current_company.ilike.%${search}%`);
      }
      if (workAuth !== 'all') {
        query = query.eq('work_authorization', workAuth);
      }
      if (availability !== 'all') {
        query = query.eq('availability', availability);
      }
      const { data } = await query;
      setCandidates((data as Candidate[]) ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchFiltered(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input placeholder="Search name, email, company…" value={search} onChange={(e)=>setSearch(e.target.value)} className="w-72" />
        <Select value={workAuth} onValueChange={setWorkAuth as any}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Work Auth" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Work Auth</SelectItem>
            <SelectItem value="US Citizen">US Citizen</SelectItem>
            <SelectItem value="Green Card">Green Card</SelectItem>
            <SelectItem value="H1B">H1B</SelectItem>
            <SelectItem value="OPT">OPT</SelectItem>
            <SelectItem value="Requires Sponsorship">Requires Sponsorship</SelectItem>
          </SelectContent>
        </Select>
        <Select value={availability} onValueChange={setAvailability as any}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Availability" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Availability</SelectItem>
            <SelectItem value="immediately">Immediately</SelectItem>
            <SelectItem value="2_weeks">2 weeks</SelectItem>
            <SelectItem value="1_month">1 month</SelectItem>
            <SelectItem value="3_months">3 months</SelectItem>
            <SelectItem value="not_looking">Not looking</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={fetchFiltered} disabled={loading}>Apply</Button>
      </div>

      <div className="overflow-x-auto rounded border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b bg-muted/30">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Company</th>
              <th className="py-2 pr-4">Title</th>
              <th className="py-2 pr-4">Experience</th>
              <th className="py-2 pr-4">Location</th>
              <th className="py-2 pr-4">Work Auth</th>
              <th className="py-2 pr-4">Referred</th>
            </tr>
          </thead>
          <tbody>
            {candidates.length === 0 ? (
              <tr><td className="py-4 px-4 text-muted-foreground" colSpan={7}>No candidates found.</td></tr>
            ) : (
              candidates.map(c => (
                <tr key={c.id} className="border-b last:border-none">
                  <td className="py-2 pr-4 font-medium">{[c.first_name, c.last_name].filter(Boolean).join(' ') || c.email}</td>
                  <td className="py-2 pr-4">{c.current_company || '—'}</td>
                  <td className="py-2 pr-4">{c.current_title || '—'}</td>
                  <td className="py-2 pr-4">{c.years_experience ?? '—'}</td>
                  <td className="py-2 pr-4">{c.location || '—'}</td>
                  <td className="py-2 pr-4">{c.work_authorization || '—'}</td>
                  <td className="py-2 pr-4">{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


