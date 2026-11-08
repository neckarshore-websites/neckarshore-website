"use client";
import { Search } from "lucide-react";
import { useSearch } from "./SearchProvider";

/**
 * Header search trigger. Matches the Nav link colours (light/dark) and shows the
 * ⌘K hint on xl+ only. Mounted in both the desktop and the mobile Nav rows.
 * The accessible name comes from the content, so the visible ⌘K hint is part of it
 * where it shows (WCAG 2.5.3 Label in Name) and drops out where it is display:none.
 */
export function SearchButton({ className = "" }: { className?: string }) {
  const { setOpen } = useSearch();
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-keyshortcuts="Meta+K Control+K"
      className={`inline-flex items-center gap-1.5 rounded-md p-2 text-primary/70 transition-colors duration-150 hover:text-accent dark:text-text-tertiary dark:hover:text-accent ${className}`}
    >
      <Search size={18} aria-hidden="true" />
      <span className="sr-only">Suche öffnen</span>{" "}
      <span className="hidden text-xs text-muted dark:text-text-tertiary xl:inline">⌘K</span>
    </button>
  );
}
