'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export function QuickReferralForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const [jobId, setJobId] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit() {
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId, candidate_email: candidateEmail, referrer_notes: notes }),
      });
      if (!res.ok) throw new Error('Failed to submit referral');
      setMessage('Referral submitted');
      setJobId('');
      setCandidateEmail('');
      setNotes('');
      onSubmitted?.();
    } catch (e: any) {
      setMessage(e?.message || 'Error submitting referral');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="grid gap-2 md:grid-cols-3">
        <div>
          <div className="text-xs mb-1">Job ID</div>
          <Input value={jobId} onChange={e=>setJobId(e.target.value)} placeholder="job_..." />
        </div>
        <div className="md:col-span-2">
          <div className="text-xs mb-1">Candidate Email</div>
          <Input type="email" value={candidateEmail} onChange={e=>setCandidateEmail(e.target.value)} placeholder="name@company.com" />
        </div>
      </div>
      <div>
        <div className="text-xs mb-1">Notes (optional)</div>
        <Textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Why is this a great fit?" />
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={submit} disabled={submitting || !jobId || !candidateEmail}>{submitting ? 'Submitting…' : 'Submit Referral'}</Button>
        {message && <div className="text-xs text-muted-foreground">{message}</div>}
      </div>
    </div>
  );
}


