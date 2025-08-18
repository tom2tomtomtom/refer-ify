'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export function CandidateDetailModal({ open, onOpenChange, children }: { open: boolean; onOpenChange: (v: boolean)=>void; children: React.ReactNode }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed inset-y-6 left-1/2 w-[95vw] max-w-3xl -translate-x-1/2 overflow-auto rounded-lg bg-white p-4 shadow-xl focus:outline-none">
          <div className="flex justify-end">
            <button onClick={() => onOpenChange(false)} aria-label="Close" className="rounded p-1 hover:bg-muted">
              <X className="h-5 w-5" />
            </button>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}


