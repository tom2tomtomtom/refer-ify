"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface Job {
  id: string;
  title?: string | null;
  description?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  currency?: string | null;
  requirements?: Record<string, unknown> | null;
}

export function ReferralForm({ job, onSubmitted }: { job: Job | null; onSubmitted?: (id: string) => void }) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [resumeName, setResumeName] = useState<string>("");
  const [resumePath, setResumePath] = useState<string | null>(null);
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    candidate_email: "",
    candidate_phone: "",
    candidate_linkedin: "",
    current_company: "",
    current_title: "",
    experience_years: 0,
    location: "",
    salary_min: "",
    salary_max: "",
    currency: "USD",
    work_auth: "US Citizen",
    availability: "immediate",
    relationship: "Former Colleague",
    confidence: 3,
    referrer_notes: "",
    consent_given: false,
  });

  useEffect(() => { setEmailExists(null); }, [form.candidate_email]);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/(pdf|doc|docx)$/i.test(file.name)) {
      toast.error("Invalid file type. Upload PDF, DOC or DOCX");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large. Max 5MB");
      return;
    }

    setUploading(true);
    setUploadProgress(10);
    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name}`;
      const { data, error } = await supabase.storage.from("resumes").upload(fileName, file, { upsert: true });
      if (error) throw error;
      setUploadProgress(100);
      setResumeName(file.name);
      setResumePath(data?.path ?? null);
      toast.success("Resume uploaded");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const checkDuplicateEmail = async () => {
    if (!form.candidate_email) return;
    const { data } = await supabase
      .from("candidates")
      .select("id")
      .eq("email", form.candidate_email.toLowerCase())
      .maybeSingle();
    setEmailExists(!!data);
  };

  const submit = async () => {
    if (!form.consent_given) { toast.error("You must provide GDPR consent"); return; }
    if (!form.first_name || !form.last_name) { toast.error("Provide first and last name"); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.candidate_email)) { toast.error("Enter a valid email"); return; }
    if (form.salary_min && form.salary_max && Number(form.salary_min) > Number(form.salary_max)) { toast.error("Salary min must be less than max"); return; }

    try {
      setSubmitting(true);

      // 1) Upsert candidate
      const { data: candidate, error: candErr } = await supabase
        .from("candidates")
        .upsert({
          email: form.candidate_email.toLowerCase(),
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.candidate_phone,
          linkedin_url: form.candidate_linkedin || null,
          current_company: form.current_company || null,
          current_title: form.current_title || null,
          years_experience: form.experience_years,
          location: form.location || null,
          salary_expectation_min: form.salary_min ? Number(form.salary_min) : null,
          salary_expectation_max: form.salary_max ? Number(form.salary_max) : null,
          work_authorization: form.work_auth,
          availability: form.availability,
          resume_url: resumePath,
          resume_filename: resumeName || null,
        })
        .select()
        .single();
      if (candErr) throw candErr;

      // 2) Create referral (attach current user as referrer)
      const { data: auth } = await supabase.auth.getUser();
      const { data: referral, error: refErr } = await supabase
        .from("referrals")
        .insert({
          job_id: job?.id,
          referrer_id: auth?.user?.id ?? null,
          candidate_email: form.candidate_email.toLowerCase(),
          candidate_name: `${form.first_name} ${form.last_name}`,
          candidate_phone: form.candidate_phone || null,
          candidate_linkedin: form.candidate_linkedin || null,
          referrer_notes: form.referrer_notes || null,
          expected_salary: form.salary_max ? Number(form.salary_max) : null,
          availability: form.availability,
          consent_given: true,
          resume_storage_path: resumePath,
          status: "submitted",
        })
        .select()
        .single();
      if (refErr) throw refErr;

      // 3) Candidate referral tracking
      const { error: trackErr } = await supabase
        .from("candidate_referrals")
        .insert({
          referral_id: referral.id,
          candidate_id: candidate.id,
          referrer_notes: form.referrer_notes || null,
          relationship_to_candidate: form.relationship,
          referral_reason: form.referrer_notes || null,
          candidate_consent_given: true,
          candidate_consent_date: new Date().toISOString(),
          referrer_confidence: form.confidence,
        });
      if (trackErr) throw trackErr;

      toast.success("Referral submitted! Tracking ID issued.");
      if (onSubmitted && referral?.id) onSubmitted(referral.id);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Refer a Professional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {job && (
            <div className="rounded border p-4 bg-muted/30">
              <div className="font-semibold">{job.title}</div>
              <div className="text-sm text-muted-foreground line-clamp-3">{job.description}</div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name *</Label>
              <Input id="first_name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name *</Label>
              <Input id="last_name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="candidate_email">Professional Email *</Label>
              <Input id="candidate_email" type="email" value={form.candidate_email} onBlur={checkDuplicateEmail} onChange={(e) => setForm({ ...form, candidate_email: e.target.value })} />
              {emailExists === true && <p className="text-xs text-amber-600 mt-1">Candidate already exists in network</p>}
            </div>
            <div>
              <Label htmlFor="candidate_phone">Phone</Label>
              <Input id="candidate_phone" value={form.candidate_phone} onChange={(e) => setForm({ ...form, candidate_phone: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="candidate_linkedin">LinkedIn Profile</Label>
              <Input id="candidate_linkedin" value={form.candidate_linkedin} onChange={(e) => setForm({ ...form, candidate_linkedin: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="current_company">Current Company</Label>
              <Input id="current_company" value={form.current_company} onChange={(e)=>setForm({ ...form, current_company: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="current_title">Current Title</Label>
              <Input id="current_title" value={form.current_title} onChange={(e)=>setForm({ ...form, current_title: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume">Resume / Profile (PDF, DOC, DOCX, max 5MB)</Label>
            <div className="border rounded p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span className="text-sm">{resumeName || "No file selected"} {uploading && uploadProgress > 0 ? `(${Math.round(uploadProgress)}%)` : ""}</span>
              </div>
              <Input id="resume" type="file" accept=".pdf,.doc,.docx" onChange={onFileChange} disabled={uploading} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="experience_years">Experience (years)</Label>
              <Input id="experience_years" type="number" min={0} max={40} value={form.experience_years} onChange={(e)=>setForm({ ...form, experience_years: Number(e.target.value) })} />
            </div>
            <div>
              <Label htmlFor="salary_min">Salary Min</Label>
              <Input id="salary_min" type="number" value={form.salary_min} onChange={(e) => setForm({ ...form, salary_min: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="salary_max">Salary Max</Label>
              <Input id="salary_max" type="number" value={form.salary_max} onChange={(e) => setForm({ ...form, salary_max: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="availability">Availability</Label>
              <Select value={form.availability} onValueChange={(v) => setForm({ ...form, availability: v })}>
                <SelectTrigger id="availability">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediately">Immediately</SelectItem>
                  <SelectItem value="2_weeks">2 weeks</SelectItem>
                  <SelectItem value="1_month">1 month</SelectItem>
                  <SelectItem value="3_months">3 months</SelectItem>
                  <SelectItem value="not_looking">Not looking</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="work_auth">Work Authorization</Label>
              <Select value={form.work_auth} onValueChange={(v) => setForm({ ...form, work_auth: v })}>
                <SelectTrigger id="work_auth"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="US Citizen">US Citizen</SelectItem>
                  <SelectItem value="Green Card">Green Card</SelectItem>
                  <SelectItem value="H1B">H1B</SelectItem>
                  <SelectItem value="OPT">OPT</SelectItem>
                  <SelectItem value="Requires Sponsorship">Requires Sponsorship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location (city, state)</Label>
              <Input id="location" value={form.location} onChange={(e)=>setForm({ ...form, location: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="relationship">Relationship</Label>
              <Select value={form.relationship} onValueChange={(v)=>setForm({ ...form, relationship: v })}>
                <SelectTrigger id="relationship"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Former Colleague">Former Colleague</SelectItem>
                  <SelectItem value="Conference Connection">Conference Connection</SelectItem>
                  <SelectItem value="Mutual Connection">Mutual Connection</SelectItem>
                  <SelectItem value="Alumni Network">Alumni Network</SelectItem>
                  <SelectItem value="LinkedIn Connection">LinkedIn Connection</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="confidence">Confidence (1-5)</Label>
              <Input id="confidence" type="number" min={1} max={5} value={form.confidence} onChange={(e)=>setForm({ ...form, confidence: Number(e.target.value) })} />
            </div>
          </div>

          <div>
            <Label htmlFor="referrer_notes">Why is this professional a strong fit?</Label>
            <Textarea id="referrer_notes" rows={5} maxLength={500} value={form.referrer_notes} onChange={(e) => setForm({ ...form, referrer_notes: e.target.value })} />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="consent" checked={form.consent_given} onCheckedChange={(v: boolean | "indeterminate") => setForm({ ...form, consent_given: v === true })} />
            <Label htmlFor="consent" className="text-sm text-muted-foreground">
              I confirm the candidate has given permission to be referred and understand privacy handling.
            </Label>
          </div>

          <div className="flex justify-end">
            <Button onClick={submit} disabled={uploading || submitting}>Submit Referral</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

