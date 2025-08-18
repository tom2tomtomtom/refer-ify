"use client";

import { PropsWithChildren, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ReferralForm } from "@/components/referrals/ReferralForm";

type Job = {
  id: string;
  title?: string | null;
  description?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  currency?: string | null;
  requirements?: Record<string, unknown> | null;
};

export function ReferralModal({ job, children }: PropsWithChildren<{ job: Job }>) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Refer a Candidate</DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-6">
          <ReferralForm
            job={job}
            onSubmitted={(id) => {
              setOpen(false);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}


