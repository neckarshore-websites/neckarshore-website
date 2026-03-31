"use client";

import { useEffect, useState } from "react";

export default function LiveTicker({ fetchedAt }: { fetchedAt: string }) {
  const [now, setNow] = useState(fetchedAt);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date().toISOString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="font-mono text-xs tabular-nums">
      Last Update: {now}
    </span>
  );
}
