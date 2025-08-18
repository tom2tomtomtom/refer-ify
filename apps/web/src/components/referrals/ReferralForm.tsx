"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Upload } from "lucide-react";
import { toast } from "sonner";

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
  const [uploading, setUploading] = useState(false);
  const [resumeName, setResumeName] = useState<string>("");
  const [resumePath, setResumePath] = useState<string | null>(null);
  const [form, setForm] = useState({
    candidate_name: "",
    candidate_email: "",
    candidate_phone: "",
    candidate_linkedin: "",
    referrer_notes: "",
    expected_salary: "",
    availability: "immediately",
    consent_given: false,
  });

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/(pdf|doc|docx)$/i.test(file.name)) {
      toast.error("Invalid file type. Upload PDF, DOC or DOCX");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Max 10MB");
      return;
    }

    setUploading(true);
    try {
      const res = await fetch("/api/storage/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload init failed");

      const upload = await fetch(data.signedUrl, {
        method: "PUT",
        headers: { "authorization": `Bearer ${data.token}`, "x-upsert": "true" },
        body: file
      });
      if (!upload.ok) throw new Error("Upload failed");
      setResumeName(file.name);
      toast.success("Resume uploaded");
      // store path in state for submit
      setResumePath(data.path as string);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!form.consent_given) {
      toast.error("You must provide GDPR consent");
      return;
    }
    try {
      const payload = {
        job_id: job?.id,
        candidate_name: form.candidate_name,
        candidate_email: form.candidate_email,
        candidate_phone: form.candidate_phone,
        candidate_linkedin: form.candidate_linkedin,
        referrer_notes: form.referrer_notes,
        expected_salary: form.expected_salary ? parseInt(form.expected_salary) : null,
        availability: form.availability,
        consent_given: true,
        resume_storage_path: resumePath,
      };
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit referral");
      toast.success("Referral submitted! Tracking ID issued.");
      if (onSubmitted && data.referral?.id) onSubmitted(data.referral.id);
    } catch (err) {
      toast.error((err as Error).message);
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
              <Label htmlFor="candidate_name">Professional Name *</Label>
              <Input id="candidate_name" value={form.candidate_name} onChange={(e) => setForm({ ...form, candidate_name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="candidate_email">Professional Email *</Label>
              <Input id="candidate_email" type="email" value={form.candidate_email} onChange={(e) => setForm({ ...form, candidate_email: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="candidate_phone">Phone</Label>
              <Input id="candidate_phone" value={form.candidate_phone} onChange={(e) => setForm({ ...form, candidate_phone: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="candidate_linkedin">LinkedIn Profile</Label>
              <Input id="candidate_linkedin" value={form.candidate_linkedin} onChange={(e) => setForm({ ...form, candidate_linkedin: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume">Resume / Profile (PDF, DOC, DOCX, max 10MB)</Label>
            <div className="border rounded p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span className="text-sm">{resumeName || "No file selected"}</span>
              </div>
              <Input id="resume" type="file" accept=".pdf,.doc,.docx" onChange={onFileChange} disabled={uploading} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expected_salary">Expected Salary</Label>
              <Input id="expected_salary" type="number" value={form.expected_salary} onChange={(e) => setForm({ ...form, expected_salary: e.target.value })} />
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
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="referrer_notes">Why is this professional a strong fit?</Label>
            <Textarea id="referrer_notes" rows={5} value={form.referrer_notes} onChange={(e) => setForm({ ...form, referrer_notes: e.target.value })} />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="consent" checked={form.consent_given} onCheckedChange={(v: boolean | "indeterminate") => setForm({ ...form, consent_given: v === true })} />
            <Label htmlFor="consent" className="text-sm text-muted-foreground">
              I have the candidate&apos;s consent to share their information with Refer-ify and client companies. I understand the privacy policy and data retention.
            </Label>
          </div>

          <div className="flex justify-end">
            <Button onClick={submit} disabled={uploading}>Submit Referral</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


