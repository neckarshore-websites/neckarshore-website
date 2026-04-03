"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface ImageModalProps {
  src: string;
  alt: string;
  children: React.ReactNode;
  className?: string;
}

export default function ImageModal({ src, alt, children, className }: ImageModalProps) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={className || "cursor-pointer text-accent underline decoration-accent/30 underline-offset-2 transition-colors hover:text-accent-hover hover:decoration-accent"}
      >
        {children}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <button
              onClick={close}
              className="absolute -top-3 -right-3 z-10 rounded-full bg-surface p-2 text-text-primary shadow-lg transition-colors hover:bg-accent"
              aria-label="Schließen"
            >
              <X size={20} />
            </button>
            <Image
              src={src}
              alt={alt}
              width={1200}
              height={800}
              className="max-h-[85vh] max-w-full rounded-xl object-contain"
              quality={80}
            />
          </div>
        </div>
      )}
    </>
  );
}
