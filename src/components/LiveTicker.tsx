"use client";

import { useEffect, useState } from "react";

export default function LiveTicker({ fetchedAt }: { fetchedAt: string }) {
  const [display, setDisplay] = useState<string>("");

  useEffect(() => {
    // Format once on mount — no interval needed
    try {
      const date = new Date(fetchedAt);
      setDisplay(
        date.toLocaleString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } catch {
      setDisplay(fetchedAt);
    }
  }, [fetchedAt]);

  if (!display) return null;

  return (
    <span className="font-mono text-xs tabular-nums">
      Stats aktualisiert: {display}
    </span>
  );
}
