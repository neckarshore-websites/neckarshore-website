import Image from "next/image";

export function NIcon({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <Image
      src="/images/neckarshore-logo-n.jpg"
      alt="neckarshore.ai logo"
      width={40}
      height={42}
      className={`rounded-[3px] ${className}`}
      priority
    />
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
      <NIcon className="h-[1.4em] w-auto shrink-0 object-contain" />
      <span className="font-heading text-[1.2em] font-semibold uppercase tracking-tight leading-none text-inherit">
        ECKARSHORE<span className="text-accent dark:text-accent-bright">.AI</span>
      </span>
    </span>
  );
}
