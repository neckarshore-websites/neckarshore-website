export default function Logo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 280 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="neckarshore.ai"
    >
      {/* N-River Icon */}
      <g>
        {/* N letter structure */}
        <path
          d="M4 36V4h4l16 22V4h4v32h-4L8 14v22H4z"
          fill="#0A2540"
        />
        {/* Subtle river wave accent */}
        <path
          d="M6 24c3-2 6-2 9 0s6 2 9 0"
          stroke="#00B8D4"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </g>
      {/* Wordmark */}
      <text
        x="40"
        y="28"
        fontFamily="var(--font-space-grotesk), 'Space Grotesk', system-ui"
        fontSize="22"
        fontWeight="600"
        fill="#0A2540"
        letterSpacing="-0.02em"
      >
        neckarshore
      </text>
      <text
        x="207"
        y="28"
        fontFamily="var(--font-space-grotesk), 'Space Grotesk', system-ui"
        fontSize="22"
        fontWeight="600"
        fill="#00B8D4"
        letterSpacing="-0.02em"
      >
        .ai
      </text>
    </svg>
  );
}
