'use client';

import { useState } from 'react';

const STATUS = [
  { key: 'submitted', label: 'Submitted', color: 'text-blue-600' },
  { key: 'reviewed', label: 'Reviewed', color: 'text-yellow-600' },
  { key: 'shortlisted', label: 'Shortlisted', color: 'text-orange-600' },
  { key: 'interviewing', label: 'Interviewing', color: 'text-purple-600' },
  { key: 'hired', label: 'Hired', color: 'text-green-600' },
  { key: 'rejected', label: 'Rejected', color: 'text-red-600' },
];

export function CandidateStatusTabs({ counts, onChange }: { counts: Partial<Record<string, number>>; onChange: (status: string | null) => void }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div className="flex flex-wrap gap-2">
      <button className={`px-3 py-1 text-xs rounded border ${active===null?'bg-black text-white':'bg-white'}`} onClick={()=>{ setActive(null); onChange(null); }}>All</button>
      {STATUS.map(s => (
        <button key={s.key} className={`px-3 py-1 text-xs rounded border ${active===s.key?'bg-black text-white':'bg-white'}`} onClick={()=>{ setActive(s.key); onChange(s.key); }}>
          <span className={s.color}>{s.label}</span>
          <span className="ml-2 text-muted-foreground">{counts[s.key] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}


