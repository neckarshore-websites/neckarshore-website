/**
 * LiveTicker — renders the "Stats aktualisiert: <date>" label.
 *
 * Server component: formats the timestamp at request time using a fixed
 * de-DE locale. No client JS, no useEffect, no hydration cost.
 *
 * Previous implementation deferred formatting to a client useEffect to avoid
 * server/client locale mismatch. With an explicit `de-DE` locale arg passed
 * to `toLocaleString`, server output IS deterministic — no mismatch risk.
 */
export default function LiveTicker({ fetchedAt }: { fetchedAt: string }) {
  let display: string;
  try {
    display = new Date(fetchedAt).toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Berlin",
    });
  } catch {
    display = fetchedAt;
  }

  if (!display) return null;

  return (
    <span className="font-mono text-xs tabular-nums">
      Stats aktualisiert: {display}
    </span>
  );
}
