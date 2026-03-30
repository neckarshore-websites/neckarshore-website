import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "neckarshore.ai — Software Development. Closer to Home.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          width: "100%",
          height: "100%",
          padding: "80px",
          background: "linear-gradient(135deg, #0A2540 0%, #1E2937 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "40px",
          }}
        >
          {/* Simple N icon */}
          <svg viewBox="0 0 40 40" width="48" height="48">
            <rect width="40" height="40" rx="8" fill="#1E2937" />
            <path d="M8 32V8h4l16 18V8h4v24h-4L12 14v18H8z" fill="#F1F5F9" />
            <path
              d="M10 24c3-2 6-2 9 0s6 2 9 0"
              stroke="#00B8D4"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <span style={{ fontSize: "28px", color: "#CBD5E1", fontWeight: 600 }}>
            neckarshore
          </span>
          <span style={{ fontSize: "28px", color: "#00B8D4", fontWeight: 600 }}>
            .ai
          </span>
        </div>

        <div
          style={{
            fontSize: "56px",
            fontWeight: 700,
            color: "#F1F5F9",
            lineHeight: 1.15,
            maxWidth: "800px",
          }}
        >
          Software Development.
          <br />
          Closer to Home.
        </div>

        <div
          style={{
            fontSize: "22px",
            color: "#CBD5E1",
            marginTop: "24px",
            maxWidth: "700px",
            lineHeight: 1.5,
          }}
        >
          KI-beschleunigte Softwareentwicklung aus Stuttgart.
          DSGVO-by-Design. Made in Germany. AI-Powered.
        </div>

        <div
          style={{
            display: "flex",
            gap: "24px",
            marginTop: "auto",
            fontSize: "16px",
            color: "#64748B",
          }}
        >
          <span>neckarshore.ai</span>
          <span>Stuttgart, Deutschland</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
