import { getSupabaseServerComponentClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Suspense } from "react";

export default async function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await getSupabaseServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const role = profile?.role ?? null;

  const { id } = await params;
  const { data: candidate } = await supabase.from('candidates').select('*').eq('id', id).single();
  if (!candidate) return <div className="p-6">Candidate not found.</div>;

  // Latest referral
  const { data: referral } = await supabase
    .from('referrals')
    .select('*, job:jobs(*), referrer:profiles!referrer_id(first_name,last_name)')
    .eq('candidate_email', candidate.email)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // Signed resume URL if exists
  let resumeSignedUrl: string | null = null;
  try {
    const path = candidate.resume_url as string | null;
    if (path) {
      const { data } = await supabase.storage.from('resumes').createSignedUrl(path, 60 * 15);
      resumeSignedUrl = data?.signedUrl ?? null;
    }
  } catch {}

  function StatusBadge({ status }: { status?: string }) {
    const color = status === 'submitted' ? 'bg-blue-100 text-blue-700'
      : status === 'reviewed' ? 'bg-yellow-100 text-yellow-700'
      : status === 'shortlisted' ? 'bg-orange-100 text-orange-700'
      : status === 'interviewing' ? 'bg-purple-100 text-purple-700'
      : status === 'hired' ? 'bg-green-100 text-green-700'
      : status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700';
    return <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${color}`}>{status || '—'}</span>;
  }

  return (
    <div className="px-4 py-6 md:px-6 space-y-6">
      <div className="text-xs text-muted-foreground mb-2"><Link href="/candidates">Candidates</Link> &gt; {candidate.first_name} {candidate.last_name}</div>

      <Card>
        <CardHeader>
          <CardTitle>Candidate Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-xl font-semibold">{candidate.first_name} {candidate.last_name}</div>
          <div className="text-sm text-muted-foreground">{candidate.current_title || '—'} at {candidate.current_company || '—'}</div>
          <div className="text-sm">Email: {candidate.email}</div>
          {candidate.phone && <div className="text-sm">Phone: {candidate.phone}</div>}
          {candidate.linkedin_url && <div className="text-sm"><a className="underline" href={candidate.linkedin_url} target="_blank">LinkedIn</a></div>}
          <div className="text-sm mt-2">Status: <StatusBadge status={referral?.status} /></div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Resume</CardTitle></CardHeader>
          <CardContent>
            {resumeSignedUrl ? (
              <div className="space-y-3">
                <a className="underline" href={resumeSignedUrl} target="_blank" rel="noreferrer">Download Resume</a>
                <div className="text-xs text-muted-foreground">Preview is limited; open in a new tab for full view.</div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No resume on file.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Referral Status</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs">
              {['submitted','reviewed','shortlisted','interviewing','hired'].map(s => (
                <div key={s} className="flex items-center gap-2">
                  <StatusBadge status={s} />
                  <div className="h-px w-6 bg-muted" />
                </div>
              ))}
              <StatusBadge status={'rejected'} />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">Current: <StatusBadge status={referral?.status} /></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Client Notes</CardTitle></CardHeader>
        <CardContent>
          {role === 'client' ? (
            <NotesClient candidateId={id} defaultValue={referral?.client_notes || ''} />
          ) : (
            <div className="text-sm text-muted-foreground">Only clients can edit notes.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
        <CardContent>
          {role === 'client' ? (
            <StatusActionsClient candidateId={id} />
          ) : (
            <div className="text-sm text-muted-foreground">Only clients can update status.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Client-only interactive pieces
function NotesClient({ candidateId, defaultValue }: { candidateId: string; defaultValue: string }) {
  'use client';
  const [value, setValue] = (global as any).React?.useState?.(defaultValue) || require('react').useState(defaultValue);
  const [saving, setSaving] = (global as any).React?.useState?.(false) || require('react').useState(false);
  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/candidates/${candidateId}/notes`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ notes: value }) });
      if (!res.ok) throw new Error('Failed to save');
    } finally { setSaving(false); }
  }
  return (
    <div className="space-y-2">
      <textarea value={value} onChange={e=>setValue(e.target.value)} className="w-full min-h-[120px] rounded border p-2 text-sm" />
      <div className="text-right">
        <button onClick={save} disabled={saving} className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-60">{saving?'Saving…':'Save Notes'}</button>
      </div>
    </div>
  );
}

function StatusActionsClient({ candidateId }: { candidateId: string }) {
  'use client';
  const [pending, setPending] = (global as any).React?.useState?.(false) || require('react').useState(false);
  async function setStatus(status: string) {
    setPending(true);
    try {
      const res = await fetch(`/api/candidates/${candidateId}/status`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ status }) });
      if (!res.ok) throw new Error('Failed to update status');
    } finally { setPending(false); }
  }
  return (
    <div className="flex flex-wrap gap-2 text-sm">
      {['submitted','reviewed','shortlisted','interviewing','hired','rejected'].map(s => (
        <button key={s} onClick={()=>setStatus(s)} disabled={pending} className="rounded border px-3 py-1 hover:bg-muted disabled:opacity-60">Mark {s}</button>
      ))}
    </div>
  );
}



