'use client';

import { useMemo, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';

type Session = {
  id: string;
  client_company: string | null;
  session_date: string;
  duration_hours: number;
  rate_per_hour: number | null;
  session_type?: string | null;
  status: string;
  notes?: string | null;
};

const SESSION_TYPES = ['Strategy','Hiring','Network','Market Intel'] as const;

export function AdvisorySessionsClient({ founderId, initialSessions }: { founderId: string; initialSessions: Session[] }) {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [sessions, setSessions] = useState<Session[]>(initialSessions);

  // New session form state
  const [company, setCompany] = useState('');
  const [datetime, setDatetime] = useState('');
  const [duration, setDuration] = useState(1);
  const [rate, setRate] = useState(500);
  const [type, setType] = useState<(typeof SESSION_TYPES)[number]>('Strategy');
  const [agenda, setAgenda] = useState('');
  const [creating, setCreating] = useState(false);

  async function createSession() {
    setCreating(true);
    try {
      const { error, data } = await supabase
        .from('advisory_sessions')
        .insert({
          founder_id: founderId,
          client_company: company || null,
          session_date: new Date(datetime).toISOString(),
          duration_hours: duration,
          rate_per_hour: rate,
          session_type: type,
          notes: agenda || null,
          status: 'scheduled',
        })
        .select('*')
        .single();
      if (error) throw error;
      setSessions((prev) => [...prev, data as unknown as Session]);
      setCompany(''); setDatetime(''); setDuration(1); setRate(500); setType('Strategy'); setAgenda('');
      router.refresh();
    } catch (e) {
      console.error('Create session error:', e);
    } finally {
      setCreating(false);
    }
  }

  async function completeSession(id: string) {
    try {
      const { error } = await supabase.from('advisory_sessions').update({ status: 'completed' }).eq('id', id);
      if (error) throw error;
      setSessions((prev) => prev.map(s => s.id === id ? { ...s, status: 'completed' } : s));
      router.refresh();
    } catch (e) {
      console.error('Complete session error:', e);
    }
  }

  async function rescheduleSession(id: string, newISO: string) {
    try {
      const { error } = await supabase.from('advisory_sessions').update({ session_date: newISO }).eq('id', id);
      if (error) throw error;
      setSessions((prev) => prev.map(s => s.id === id ? { ...s, session_date: newISO } : s));
      router.refresh();
    } catch (e) {
      console.error('Reschedule error:', e);
    }
  }

  const upcoming = sessions.filter(s => s.status === 'scheduled').sort((a,b) => a.session_date.localeCompare(b.session_date));

  return (
    <div className="space-y-6">
      {/* New session form */}
      <div className="rounded border bg-white p-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Client Company</Label>
            <Input value={company} onChange={e=>setCompany(e.target.value)} placeholder="TechCorp" />
          </div>
          <div className="grid gap-2">
            <Label>Session Type</Label>
            <select className="rounded border px-3 py-2 text-sm" value={type} onChange={e=>setType(e.target.value as any)}>
              {SESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid gap-2">
            <Label>Date & Time</Label>
            <Input type="datetime-local" value={datetime} onChange={e=>setDatetime(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Duration (hours)</Label>
            <Input type="number" min={0.5} step={0.5} value={duration} onChange={e=>setDuration(Number(e.target.value))} />
          </div>
          <div className="grid gap-2">
            <Label>Rate ($/hour)</Label>
            <Input type="number" min={0} step={50} value={rate} onChange={e=>setRate(Number(e.target.value))} />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label>Agenda / Notes</Label>
            <Textarea rows={3} value={agenda} onChange={e=>setAgenda(e.target.value)} placeholder="Objectives, preparation, materials…" />
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <Button onClick={createSession} disabled={!datetime || creating}>Schedule Session</Button>
        </div>
      </div>

      {/* Upcoming sessions */}
      <div className="rounded border bg-white p-4">
        <div className="text-sm font-semibold mb-2">Upcoming Sessions</div>
        {upcoming.length === 0 ? (
          <div className="text-sm text-muted-foreground">No upcoming sessions scheduled.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Company</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Hours</th>
                  <th className="py-2 pr-4">Rate</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map(s => (
                  <tr key={s.id} className="border-b last:border-none">
                    <td className="py-2 pr-4">{new Date(s.session_date).toLocaleString()}</td>
                    <td className="py-2 pr-4">{s.client_company || '—'}</td>
                    <td className="py-2 pr-4">{s.session_type || '—'}</td>
                    <td className="py-2 pr-4">{s.duration_hours}</td>
                    <td className="py-2 pr-4">${(s.rate_per_hour ?? 500).toLocaleString()}</td>
                    <td className="py-2 pr-4 flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={()=>completeSession(s.id)}>Complete</Button>
                      <RescheduleButton onReschedule={(iso)=>rescheduleSession(s.id, iso)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function RescheduleButton({ onReschedule }: { onReschedule: (iso: string) => void }) {
  const [open, setOpen] = useState(false);
  const [dt, setDt] = useState('');
  return (
    <div className="inline-flex items-center gap-2">
      {!open ? (
        <Button variant="outline" size="sm" onClick={()=>setOpen(true)}>Reschedule</Button>
      ) : (
        <div className="flex items-center gap-2">
          <Input type="datetime-local" value={dt} onChange={e=>setDt(e.target.value)} className="h-8" />
          <Button size="sm" onClick={()=>{ if (dt) { onReschedule(new Date(dt).toISOString()); setOpen(false); setDt(''); }}}>Save</Button>
          <Button size="sm" variant="ghost" onClick={()=>{ setOpen(false); setDt(''); }}>Cancel</Button>
        </div>
      )}
    </div>
  );
}


