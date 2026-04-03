"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { href: "/#services", label: "Services" },
  { href: "/#why-nearshore", label: "Warum Nearshore" },
  { href: "/#omnixis", label: "OMNIXIS" },
  { href: "/#founder", label: "Über uns" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-primary/5 bg-neutral-light/80 backdrop-blur-md dark:border-text-secondary/10 dark:bg-deep-space/80">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-3 md:px-6">
        <a href="/" className="flex items-center gap-2" aria-label="neckarshore.ai Home">
          <Logo size="text-xl" className="text-primary dark:text-text-primary" />
        </a>

        {/* Desktop */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-primary/70 transition-colors duration-150 hover:text-accent dark:text-text-secondary/70 dark:hover:text-accent"
            >
              {link.label}
            </a>
          ))}
          <ThemeToggle />
          <a
            href="https://calendly.com/rauhut/20min"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:bg-accent-hover hover:scale-[1.02] active:scale-[0.98]"
            data-track="cta_click"
          >
            Kennenlerntermin
          </a>
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setOpen(!open)}
            className="p-2 text-primary dark:text-text-primary"
            aria-label={open ? "Menü schließen" : "Menü öffnen"}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-primary/5 bg-neutral-light px-4 pb-6 pt-4 dark:border-text-secondary/10 dark:bg-deep-space md:hidden">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-base font-medium text-primary/70 transition-colors hover:text-accent dark:text-text-secondary/70 dark:hover:text-accent"
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://calendly.com/rauhut/20min"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="mt-4 block rounded-lg bg-accent py-3 text-center text-base font-medium text-white transition-all hover:bg-accent-hover"
            data-track="cta_click"
          >
            Kennenlerntermin
          </a>
        </div>
      )}
    </nav>
  );
}
