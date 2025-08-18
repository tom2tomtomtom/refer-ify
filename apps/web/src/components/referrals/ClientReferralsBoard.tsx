"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type Referral = {
  id: string;
  candidate_name: string | null;
  candidate_email: string | null;
  status: "submitted" | "reviewed" | "shortlisted" | "interviewing" | "hired" | "rejected";
  resume_storage_path: string | null;
  referrer_notes: string | null;
  created_at: string;
};

const PIPELINE: Array<Referral["status"]> = [
  "submitted",
  "reviewed",
  "shortlisted",
  "interviewing",
  "hired",
  "rejected",
];

const STATUS_LABEL: Record<Referral["status"], string> = {
  submitted: "Submitted",
  reviewed: "Reviewed",
  shortlisted: "Shortlisted",
  interviewing: "Interviewing",
  hired: "Hired",
  rejected: "Rejected",
};

const STATUS_BADGE: Record<Referral["status"], string> = {
  submitted: "bg-blue-50 text-blue-700",
  reviewed: "bg-purple-50 text-purple-700",
  shortlisted: "bg-yellow-50 text-yellow-800",
  interviewing: "bg-amber-50 text-amber-800",
  hired: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
};

export function ClientReferralsBoard({ jobId }: { jobId: string }) {
  const supabase = getSupabaseBrowserClient();
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState<Referral[]>([]);

  const fetchReferrals = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/jobs/${jobId}/referrals`);
    const data = await res.json();
    if (res.ok) setReferrals(data.referrals || []);
    setLoading(false);
  }, [jobId]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  useEffect(() => {
    const channel = supabase
      .channel("referrals-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "referrals" }, () => {
        fetchReferrals();
        toast.success("Referrals updated");
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchReferrals]);

  const groups = useMemo(() => {
    const map: Record<Referral["status"], Referral[]> = {
      submitted: [],
      reviewed: [],
      shortlisted: [],
      interviewing: [],
      hired: [],
      rejected: [],
    };
    referrals.forEach(r => map[r.status || "submitted" as Referral["status"]].push(r));
    return map;
  }, [referrals]);

  const move = async (id: string, status: Referral["status"]) => {
    const prev = referrals;
    setReferrals(prev.map(r => (r.id === id ? { ...r, status } : r)));
    const res = await fetch(`/api/referrals/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (!res.ok) {
      toast.error("Failed to update status");
      setReferrals(prev);
    }
  };

  const openResume = async (id: string) => {
    const res = await fetch(`/api/referrals/${id}/resume`);
    const data = await res.json();
    if (res.ok && data.url) {
      window.open(data.url, "_blank");
    } else {
      toast.error(data.error || "Resume not available");
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 p-4">
        {PIPELINE.map(s => (
          <Card key={s}><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 p-4">
      {PIPELINE.map(status => (
        <Card key={status} className="min-h-[200px]">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              {STATUS_LABEL[status]}
              <Badge className={STATUS_BADGE[status]}>{groups[status]?.length || 0}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(groups[status] || []).map(r => (
              <div key={r.id} className="rounded border p-3 bg-muted/30">
                <div className="font-medium text-sm">{r.candidate_name || r.candidate_email}</div>
                <div className="text-xs text-muted-foreground mb-2">{new Date(r.created_at).toLocaleDateString()}</div>
                <div className="flex gap-2">
                  {status !== "hired" && status !== "rejected" && (
                    <Button size="sm" variant="outline" onClick={() => move(r.id, "reviewed")}>Review</Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => openResume(r.id)}>Resume</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


