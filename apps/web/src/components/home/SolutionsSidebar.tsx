"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Item = {
  number: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
};

const ITEMS: Item[] = [
  {
    number: "01",
    title: "Founders",
    subtitle: "Elite Network",
    cta: "Get Started",
    href: "/join-network",
  },
  {
    number: "02",
    title: "Referrers",
    subtitle: "Quality Referrers",
    cta: "Join Referrer Network",
    href: "/join-network",
  },
  {
    number: "03",
    title: "Client Solutions",
    subtitle: "Executive Hiring",
    cta: "Explore Solutions",
    href: "/for-companies",
  },
];

export function SolutionsSidebar() {
  return (
    <aside className="space-y-3">
      {ITEMS.map((item, idx) => (
        <Card key={item.number} className={idx === 0 ? "border-foreground/20 shadow-sm" : ""}>
          <CardContent className="p-4 flex items-start justify-between gap-3">
            <div>
              <div className="text-xs tracking-widest text-muted-foreground">{item.number}</div>
              <div className="text-sm font-semibold leading-tight">{item.title}</div>
              <div className="text-xs text-muted-foreground">{item.subtitle}</div>
            </div>
            <a href={item.href}>
              <Button size="sm" variant={idx === 0 ? "default" : "outline"}>{item.cta}</Button>
            </a>
          </CardContent>
        </Card>
      ))}
    </aside>
  );
}


