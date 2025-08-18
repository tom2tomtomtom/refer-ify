"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function JobFeedRealtime() {
  const supabase = getSupabaseBrowserClient();
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    async function loadCount() {
      const { count } = await supabase.from("jobs").select("*", { count: "exact", head: true });
      if (isMounted && typeof count === "number") setCount(count);
    }
    loadCount();

    const channel = supabase
      .channel("jobs-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "jobs" }, () => loadCount())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "jobs" }, () => loadCount())
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return <p className="text-sm text-muted-foreground">Live jobs: {count}</p>;
}


