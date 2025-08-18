'use client';

import { useMemo, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';

type Props = {
  founderId: string;
};

const RELATIONSHIPS = [
  'Former Colleague',
  'Conference Connection',
  'Referral Introduction',
  'Alumni Network',
] as const;

const EXPERTISE = ['Engineering','Product','Sales','Marketing','Finance','Operations','People'] as const;

export function InviteForm({ founderId }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [relationship, setRelationship] = useState<(typeof RELATIONSHIPS)[number]>('Former Colleague');
  const [expertise, setExpertise] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [checking, setChecking] = useState(false);
  const [existsMsg, setExistsMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function defaultTemplate(r: string) {
    return `Hi ${name || 'there'},\n\nI’d like to invite you to join Refer-ify’s Select Circle — a private network of senior operators making trusted referrals. Given your experience in ${expertise.join(', ') || 'your domain'} at ${company || 'your company'}, I believe you’d be an excellent fit.\n\nHappy to answer any questions. — ${r}`;
  }

  // populate template on relationship change
  function onRelationshipChange(value: (typeof RELATIONSHIPS)[number]) {
    setRelationship(value);
    setMessage(defaultTemplate(value));
  }

  async function validateEmail() {
    setChecking(true);
    setExistsMsg(null);
    try {
      const { data } = await supabase.from('profiles').select('id,role,company').eq('email', email.toLowerCase()).maybeSingle();
      if (data) setExistsMsg('This email is already in the network.');
      else setExistsMsg('Email not found in network — good to invite.');
    } catch {
      setExistsMsg(null);
    } finally {
      setChecking(false);
    }
  }

  function isValidLinkedIn(url: string) {
    if (!url) return true;
    try { const u = new URL(url); return u.hostname.includes('linkedin.com'); } catch { return false; }
  }

  async function submit() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (!email || !email.includes('@')) throw new Error('Valid email is required');
      if (!isValidLinkedIn(linkedin)) throw new Error('LinkedIn URL must be a linkedin.com link');

      const { error } = await supabase.from('select_circle_invitations').insert({
        founder_id: founderId,
        invited_email: email.toLowerCase(),
        invited_name: name,
        invited_company: company,
        invited_title: title,
        linkedin_url: linkedin || null,
        invitation_message: message || defaultTemplate(relationship),
        relationship_context: relationship,
        expected_expertise: expertise,
        status: 'sent',
      });
      if (error) throw error;
      setSuccess('Invitation sent.');
      router.refresh();
      setName(''); setTitle(''); setCompany(''); setEmail(''); setLinkedin(''); setExpertise([]); setMessage('');
    } catch (e: any) {
      setError(e?.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label>Name</Label>
        <Input value={name} onChange={e=>setName(e.target.value)} placeholder="Sarah Chen" />
      </div>
      <div className="grid gap-2">
        <Label>Title</Label>
        <Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="VP Engineering" />
      </div>
      <div className="grid gap-2">
        <Label>Company</Label>
        <Input value={company} onChange={e=>setCompany(e.target.value)} placeholder="Meta" />
      </div>
      <div className="grid gap-2">
        <Label>Email</Label>
        <div className="flex gap-2">
          <Input value={email} onChange={e=>setEmail(e.target.value)} placeholder="sarah@company.com" />
          <Button variant="outline" onClick={validateEmail} disabled={!email || checking}>Check</Button>
        </div>
        {existsMsg && <p className={`text-xs ${existsMsg.includes('already') ? 'text-amber-600' : 'text-green-600'}`}>{existsMsg}</p>}
      </div>
      <div className="grid gap-2">
        <Label>LinkedIn URL</Label>
        <Input value={linkedin} onChange={e=>setLinkedin(e.target.value)} placeholder="https://www.linkedin.com/in/…" />
        {!isValidLinkedIn(linkedin) && <p className="text-xs text-red-600">Must be a linkedin.com URL</p>}
      </div>
      <div className="grid gap-2">
        <Label>Relationship</Label>
        <select className="rounded border px-3 py-2 text-sm" value={relationship} onChange={e=>onRelationshipChange(e.target.value as any)}>
          {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      <div className="grid gap-1">
        <Label>Expected Expertise</Label>
        <div className="flex flex-wrap gap-2">
          {EXPERTISE.map(x => (
            <button type="button" key={x} onClick={() => setExpertise(prev => prev.includes(x) ? prev.filter(i=>i!==x) : [...prev, x])} className={`px-3 py-1 text-xs rounded border ${expertise.includes(x) ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white'}`}>{x}</button>
          ))}
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Invitation Message</Label>
        <Textarea value={message} onChange={e=>setMessage(e.target.value)} rows={6} placeholder={defaultTemplate(relationship)} />
        <p className="text-[10px] text-muted-foreground">Variables supported: {'{{name}}'}, {'{{company}}'}, {'{{expertise}}'}</p>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {success && <p className="text-xs text-green-600">{success}</p>}
      <div className="flex justify-end">
        <Button onClick={submit} disabled={loading || !email || !name}>Send Invitation</Button>
      </div>
    </div>
  );
}


