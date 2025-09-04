"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Loader2, Save, Pencil, MapPin, DollarSign, FileText, BarChart3, Settings2 } from "lucide-react";

export type JobDetail = {
  id: string;
  title: string | null;
  description: string | null;
  status: "draft" | "active" | "paused" | "filled";
  location_type?: "remote" | "hybrid" | "onsite" | null;
  location_city?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  currency?: string | null;
  created_at?: string | null;
  skills?: string[] | null;
  experience_level?: "junior" | "mid" | "senior" | "executive" | null;
  job_type?: "full_time" | "contract" | "part_time" | null;
  subscription_tier?: "connect" | "priority" | "exclusive" | null;
};

const STATUS_OPTIONS: JobDetail["status"][] = ["draft", "active", "paused", "filled"];
const LOCATION_TYPES: Array<NonNullable<JobDetail["location_type"]>> = ["remote", "hybrid", "onsite"];
const JOB_TYPES: Array<NonNullable<JobDetail["job_type"]>> = ["full_time", "contract", "part_time"];
const EXPERIENCE_LEVELS: Array<NonNullable<JobDetail["experience_level"]>> = ["junior", "mid", "senior", "executive"];
const SUBSCRIPTION_TIERS: Array<NonNullable<JobDetail["subscription_tier"]>> = ["connect", "priority", "exclusive"];

type ChangeEntry = { field: string; from: string; to: string; at: string };

export function JobDetailEditor({ job: initialJob }: { job: JobDetail }) {
  const [job, setJob] = useState<JobDetail>(initialJob);
  const [saving, setSaving] = useState<string | null>(null);
  const [referralsCount, setReferralsCount] = useState<number | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [changeLog, setChangeLog] = useState<ChangeEntry[]>([]);

  useEffect(() => {
    setJob(initialJob);
  }, [initialJob]);

  const save = useCallback(async (patch: Partial<JobDetail>, label: string) => {
    setSaving(label);
    try {
      const prev = job;
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save");
      const updated: JobDetail = { ...prev, ...(data?.job || patch) } as JobDetail;
      setJob(updated);
      // Record change log entries for changed fields in patch
      const entries: ChangeEntry[] = Object.keys(patch).map((k) => {
        const key = k as keyof JobDetail;
        const fromVal = (prev as any)[key];
        const toVal = (updated as any)[key];
        if (JSON.stringify(fromVal) === JSON.stringify(toVal)) return null as any;
        const labelMap: Record<string, string> = {
          title: "Title",
          status: "Status",
          location_type: "Location Type",
          location_city: "Location City",
          salary_min: "Salary Min",
          salary_max: "Salary Max",
          currency: "Currency",
          description: "Description",
          skills: "Skills",
          experience_level: "Experience Level",
          job_type: "Job Type",
          subscription_tier: "Subscription Tier",
        };
        return {
          field: labelMap[k] || k,
          from: Array.isArray(fromVal) ? fromVal.join(", ") : fromVal ?? "",
          to: Array.isArray(toVal) ? toVal.join(", ") : toVal ?? "",
          at: new Date().toLocaleTimeString(),
        } as ChangeEntry;
      }).filter(Boolean) as ChangeEntry[];
      if (entries.length) setChangeLog((log) => [...entries, ...log].slice(0, 20));
      toast.success(`${label} saved`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || `Failed to save ${label}`);
    } finally {
      setSaving(null);
    }
  }, [job]);

  const fetchAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}/referrals`);
      const data = await res.json();
      if (res.ok) {
        setReferralsCount(Array.isArray(data?.referrals) ? data.referrals.length : 0);
      } else {
        setReferralsCount(null);
      }
    } catch {
      setReferralsCount(null);
    } finally {
      setLoadingAnalytics(false);
    }
  }, [job.id]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const createdDate = useMemo(() => job.created_at ? new Date(job.created_at).toLocaleDateString() : null, [job.created_at]);

  return (
    <div className="space-y-4">
      {/* Quick actions row */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4" /> Edit Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title + Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div className="md:col-span-2 space-y-1">
              <label className="text-sm font-medium">Title</label>
              <div className="flex gap-2">
                <Input defaultValue={job.title ?? ""} placeholder="e.g. VP of Engineering" onBlur={(e) => {
                  const value = e.currentTarget.value.trim();
                  if (value && value !== (initialJob.title ?? "")) {
                    save({ title: value }, "Title");
                  }
                }} />
                <Button variant="outline" size="icon" onClick={() => save({ title: (document.querySelector<HTMLInputElement>('input[data-title]')?.value || job.title || '') as any }, "Title")} className="hidden">
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Status</label>
              <div className="flex items-center gap-2">
                <Select defaultValue={job.status} onValueChange={(v) => save({ status: v as JobDetail["status"] }, "Status")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge variant="secondary">{saving === "Status" ? "Saving..." : job.status}</Badge>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">Location</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Select defaultValue={job.location_type ?? undefined} onValueChange={(v) => save({ location_type: v as any }, "Location Type")}>
                <SelectTrigger>
                  <SelectValue placeholder="Type (remote/hybrid/onsite)" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATION_TYPES.map((lt) => (
                    <SelectItem key={lt} value={lt}>{lt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input defaultValue={job.location_city ?? ""} placeholder="City (optional)" onBlur={(e) => {
                const v = e.currentTarget.value.trim();
                if ((v || job.location_city) && v !== (initialJob.location_city ?? "")) {
                  save({ location_city: v || null }, "Location City");
                }
              }} />
              <div className="text-sm text-muted-foreground self-center">{createdDate ? `Created ${createdDate}` : null}</div>
            </div>
          </div>

          {/* Compensation */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm font-medium">Compensation</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input type="number" min={0} step={1000} defaultValue={job.salary_min ?? undefined} placeholder="Min" onBlur={(e) => {
                const v = e.currentTarget.value; const num = v ? Number(v) : null;
                if (num !== (initialJob.salary_min ?? null)) save({ salary_min: num as any }, "Salary Min");
              }} />
              <Input type="number" min={0} step={1000} defaultValue={job.salary_max ?? undefined} placeholder="Max" onBlur={(e) => {
                const v = e.currentTarget.value; const num = v ? Number(v) : null;
                if (num !== (initialJob.salary_max ?? null)) save({ salary_max: num as any }, "Salary Max");
              }} />
              <Input defaultValue={job.currency ?? "USD"} placeholder="Currency (e.g. USD)" onBlur={(e) => {
                const v = e.currentTarget.value.trim() || null;
                if (v !== (initialJob.currency ?? null)) save({ currency: v as any }, "Currency");
              }} />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">Edit Description</span>
            </div>
            <Textarea defaultValue={job.description ?? ""} className="min-h-[140px]" onBlur={(e) => {
              const v = e.currentTarget.value.trim();
              if (v.length > 0 && v !== (initialJob.description ?? "")) {
                save({ description: v }, "Description");
              }
            }} />
          </div>

          {/* Role & Tier */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              <span className="text-sm font-medium">Role & Tier</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Select defaultValue={job.job_type ?? undefined} onValueChange={(v) => save({ job_type: v as any }, "Job Type")}>
                <SelectTrigger>
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                </SelectContent>
              </Select>
              <Select defaultValue={job.experience_level ?? undefined} onValueChange={(v) => save({ experience_level: v as any }, "Experience Level")}>
                <SelectTrigger>
                  <SelectValue placeholder="Experience Level" />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map((lvl) => (<SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>))}
                </SelectContent>
              </Select>
              <Select defaultValue={job.subscription_tier ?? undefined} onValueChange={(v) => save({ subscription_tier: v as any }, "Subscription Tier")}>
                <SelectTrigger>
                  <SelectValue placeholder="Subscription Tier" />
                </SelectTrigger>
                <SelectContent>
                  {SUBSCRIPTION_TIERS.map((tier) => (<SelectItem key={tier} value={tier}>{tier}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Skills</span>
              <span className="text-xs text-muted-foreground">Press Enter to add</span>
            </div>
            <Input
              placeholder="Add a skill (e.g., React, Leadership)"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const v = skillInput.trim();
                  if (!v) return;
                  const next = Array.from(new Set([...(job.skills ?? []), v]));
                  save({ skills: next }, "Skills");
                  setSkillInput("");
                }
              }}
            />
            <div className="flex flex-wrap gap-2">
              {(job.skills ?? []).map((s) => (
                <span key={s} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-xs">
                  {s}
                  <button
                    aria-label={`remove ${s}`}
                    onClick={() => {
                      const next = (job.skills ?? []).filter((x) => x !== s);
                      save({ skills: next }, "Skills");
                    }}
                    className="rounded hover:bg-secondary/80 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {saving && (
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving {saving}...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Basic Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Job Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-muted-foreground">Total Referrals</div>
              <div className="text-lg font-semibold">{loadingAnalytics ? <Loader2 className="h-4 w-4 animate-spin" /> : (referralsCount ?? "–")}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Status</div>
              <div className="text-lg font-semibold capitalize">{job.status}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Created</div>
              <div className="text-lg font-semibold">{createdDate || "–"}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Log */}
      <Card>
        <CardHeader>
          <CardTitle>Change Log</CardTitle>
        </CardHeader>
        <CardContent>
          {changeLog.length === 0 ? (
            <p className="text-sm text-muted-foreground">No changes yet.</p>
          ) : (
            <ul className="space-y-2">
              {changeLog.map((c, i) => (
                <li key={i} className="text-sm">
                  <span className="font-medium">{c.field}:</span> "{c.from}" → "{c.to}" <span className="text-xs text-muted-foreground">at {c.at}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default JobDetailEditor;

