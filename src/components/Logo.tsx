export function NIcon({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 36V4h4l16 22V4h4v32h-4L8 14v22H4z"
        fill="currentColor"
      />
      <path
        d="M6 24c3-2 6-2 9 0s6 2 9 0"
        stroke="#0E7490"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export default function Logo({
  size = "text-xl",
  className = "",
}: {
  size?: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${size} ${className}`}
      aria-label="NECKARSHORE.AI"
    >
      <NIcon className="h-[1.15em] w-auto shrink-0" />
      <span className="font-heading font-semibold uppercase tracking-tight leading-none text-inherit">
        ECKARSHORE<span className="text-accent">.AI</span>
      </span>
    </span>
  );
}
