"use client";

import { useEffect, useState } from "react";

export default function LiveTicker({ fetchedAt }: { fetchedAt: string }) {
  const [now, setNow] = useState(fetchedAt);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date().toISOString());
    }, 73); // ~14fps — fast enough for pseudo-precision, light on CPU
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="font-mono text-xs tabular-nums">
      Last Update: {now}
    </span>
  );
}
