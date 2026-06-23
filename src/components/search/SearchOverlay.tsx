"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type MiniSearch from "minisearch";
import { useSearch } from "./SearchProvider";
import type { SearchDoc, SearchType } from "@/lib/search/types";

type Hit = SearchDoc;

const TYPE_LABEL: Record<SearchType, string> = {
  page: "Seite",
  product: "Produkt",
};

/**
 * Builds the MiniSearch index lazily on first open (dynamic import + fetch of the
 * static /api/search-index), keeps it across opens, and renders the palette only
 * while open so its query state resets via remount. Styling uses the neckarshore
 * Tailwind tokens + `dark:` variants (not Goldoni's inline vars) so it adapts to
 * the light/dark ThemeToggle.
 */
export function SearchOverlay() {
  const { open, setOpen } = useSearch();
  const [mini, setMini] = useState<MiniSearch<SearchDoc> | null>(null);

  useEffect(() => {
    if (!open || mini) return;
    let cancelled = false;
    (async () => {
      const [{ default: MiniSearch }, res] = await Promise.all([
        import("minisearch"),
        fetch("/api/search-index"),
      ]);
      const docs: SearchDoc[] = await res.json();
      if (cancelled) return;
      const m = new MiniSearch<SearchDoc>({
        fields: ["title", "text"],
        storeFields: ["title", "type", "category", "url", "external"],
        searchOptions: { prefix: true, fuzzy: 0.2, boost: { title: 2 } },
      });
      m.addAll(docs);
      setMini(m);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, mini]);

  if (!open) return null;
  return <SearchPalette mini={mini} onClose={() => setOpen(false)} />;
}

function SearchPalette({
  mini,
  onClose,
}: {
  mini: MiniSearch<SearchDoc> | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo<Hit[]>(
    () => (q && mini ? (mini.search(q) as unknown as Hit[]).slice(0, 20) : []),
    [q, mini]
  );

  function go(hit: Hit) {
    onClose();
    // External product link-out → new tab.
    if (hit.external || /^https?:\/\//.test(hit.url)) {
      window.open(hit.url, "_blank", "noopener,noreferrer");
      return;
    }
    const [path, hash] = hit.url.split("#");
    // Same-page hash: location.assign fires a native hashchange (router.push uses
    // pushState, which does not) so the browser scrolls to the section. Cross-page
    // links (and plain pages) go through the router.
    if (hash && path === window.location.pathname) {
      window.location.assign(`#${hash}`);
    } else {
      router.push(hit.url);
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active]);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Suche"
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 p-4 pt-[12vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-xl border border-primary/10 bg-white text-primary shadow-2xl dark:border-text-secondary/15 dark:bg-surface dark:text-text-primary"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded="true"
          aria-controls="search-results"
          aria-label="Produkte und Seiten durchsuchen"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
          }}
          placeholder="Produkte, Seiten …"
          className="w-full border-b border-primary/10 bg-transparent px-5 py-4 text-base text-primary outline-none placeholder:text-muted dark:border-text-secondary/15 dark:text-text-primary dark:placeholder:text-text-tertiary"
        />
        <ul id="search-results" role="listbox" className="max-h-[55vh] overflow-y-auto">
          {!q && (
            <li className="px-5 py-6 text-sm text-muted dark:text-text-tertiary">
              Tippe, um Produkte &amp; Seiten zu durchsuchen.
            </li>
          )}
          {q && results.length === 0 && mini && (
            <li className="px-5 py-6 text-sm text-muted dark:text-text-tertiary">
              Nichts gefunden. Schreib uns gern über den Kennenlerntermin oder die Kontaktsektion.
            </li>
          )}
          {results.map((hit, i) => (
            <li key={hit.id} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(hit)}
                className={`flex w-full flex-col items-start gap-0.5 px-5 py-3 text-left ${
                  i === active ? "bg-accent/10 dark:bg-accent/20" : "bg-transparent"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted dark:bg-text-secondary/10 dark:text-text-tertiary">
                    {TYPE_LABEL[hit.type]}
                  </span>
                  <span className="font-medium text-primary dark:text-text-primary">
                    {hit.title}
                    {hit.external && <span aria-hidden className="ml-1 text-muted dark:text-text-tertiary">↗</span>}
                  </span>
                </span>
                <span className="text-xs text-muted dark:text-text-tertiary">{hit.category}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
