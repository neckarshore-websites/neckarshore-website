/**
 * Hero Image Generator — config-driven (L18a/b/c social-scrapers)
 *
 * Renders 1280×640 PNG hero images for GitHub repo READMEs / social previews.
 * Uses Playwright Chromium to rasterize HTML+SVG compositions.
 *
 * Two layouts:
 *   - "platform-bridge": split (profile-card-hint | bridge | markdown-note-stack)
 *   - "library-banner":  modules → central hub → outflows
 *
 * Run: node scripts/generate-hero-image.mjs
 */

import { chromium } from "@playwright/test";
import { readFile, stat, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { heroes } from "./hero-images.config.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

async function fileToDataUrl(relPath, mime) {
  const buf = await readFile(resolve(ROOT, relPath));
  return `data:${mime};base64,${buf.toString("base64")}`;
}

const assets = {
  spaceGrotesk: await fileToDataUrl("src/fonts/SpaceGrotesk-Variable.woff2", "font/woff2"),
  inter: await fileToDataUrl("src/fonts/Inter-Variable.woff2", "font/woff2"),
};

/** Brand tokens — sister-tool consistency with neckarshore.ai OG cards. */
const T = {
  // Background variants
  bgDeep: { a: "#070C18", b: "#0A1224", c: "#080F1E" }, // library-banner — darker, infra-layer
  bgMid: { a: "#0B1220", b: "#0F172A", c: "#0A1020" }, // platform-bridge — user-facing
  // Glow accents
  glowCyan: "rgba(34, 211, 238, 0.16)",
  glowTeal: "rgba(14, 116, 144, 0.20)",
  glowCyanSoft: "rgba(34, 211, 238, 0.08)",
  // Text
  textPrimary: "#F8FAFC",
  textSecondary: "#CBD5E1",
  textTertiary: "#94A3B8",
  textMuted: "#64748B",
  // Accents
  accent: "#22D3EE",
  accentDark: "#0E7490",
  // Surfaces
  cardBg: "rgba(30, 41, 59, 0.6)",
  cardBorder: "rgba(148, 163, 184, 0.18)",
  cardBgSubtle: "rgba(30, 41, 59, 0.35)",
  // Lines
  gridLine: "rgba(148, 163, 184, 0.05)",
  bridgeLine: "rgba(34, 211, 238, 0.35)",
};

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Common HTML head + base styles, parametrized by background intensity. */
function baseHead({ width, height, intensity }) {
  const bg = intensity === "deep" ? T.bgDeep : T.bgMid;
  const glow = intensity === "deep" ? T.glowCyanSoft : T.glowCyan;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
    @font-face {
      font-family: "Space Grotesk";
      src: url(${assets.spaceGrotesk}) format("woff2");
      font-weight: 300 700;
      font-display: block;
    }
    @font-face {
      font-family: "Inter";
      src: url(${assets.inter}) format("woff2");
      font-weight: 100 900;
      font-display: block;
    }
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
      width: ${width}px;
      height: ${height}px;
      background:
        radial-gradient(900px 500px at 88% 105%, ${glow}, transparent 65%),
        radial-gradient(700px 400px at 8% -8%, ${T.glowTeal}, transparent 65%),
        linear-gradient(180deg, ${bg.a} 0%, ${bg.b} 55%, ${bg.c} 100%);
      color: ${T.textPrimary};
      font-family: "Inter", -apple-system, system-ui, sans-serif;
      position: relative;
      overflow: hidden;
    }
    .grid-overlay {
      position: absolute; inset: 0;
      background-image:
        linear-gradient(${T.gridLine} 1px, transparent 1px),
        linear-gradient(90deg, ${T.gridLine} 1px, transparent 1px);
      background-size: 56px 56px;
      mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black 35%, transparent 95%);
      pointer-events: none;
    }
    .title-block {
      position: absolute;
      top: 56px;
      left: 64px;
      max-width: 760px;
    }
    .title {
      font-family: "Space Grotesk", sans-serif;
      font-weight: 700;
      font-size: 38px;
      line-height: 1.05;
      letter-spacing: -1.4px;
      color: ${T.textPrimary};
      margin: 0;
    }
    .subtitle {
      margin-top: 10px;
      font-family: "Inter", sans-serif;
      font-weight: 400;
      font-size: 18px;
      line-height: 1.4;
      color: ${T.textSecondary};
      letter-spacing: -0.1px;
      max-width: 520px;
    }
    .footer-tag {
      position: absolute;
      bottom: 48px;
      left: 64px;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 8px 16px;
      border: 1px solid ${T.cardBorder};
      border-radius: 999px;
      background: ${T.cardBgSubtle};
      font-family: "Inter", sans-serif;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.2px;
      color: ${T.textTertiary};
    }
    .footer-tag .dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: ${T.accent};
      box-shadow: 0 0 10px ${T.accent};
    }
  </style></head><body>
    <div class="grid-overlay"></div>`;
}

function tail() {
  return `</body></html>`;
}

function titleBlock({ title, subtitle, tagline }) {
  return `
    <div class="title-block">
      <h1 class="title">${escapeHtml(title)}</h1>
      <p class="subtitle">${escapeHtml(subtitle)}</p>
    </div>
    <div class="footer-tag"><span class="dot"></span>${escapeHtml(tagline)}</div>`;
}

/* ════════════════════════════════════════════════════════════════════════
   LIBRARY-BANNER LAYOUT (L18c — Common-Lib)

   Architectural composition: 4 module blocks (upper-left) feed lines into
   a central hexagonal hub (lower-mid). 3 outflows leave the hub toward
   right side, each terminating in a tiny platform-shape hint.
   ════════════════════════════════════════════════════════════════════════ */

function renderLibraryBanner(h) {
  const { width, height } = h;
  return `${baseHead({ width, height, intensity: "deep" })}
    <style>
      .scene { position: absolute; inset: 0; }
      .module {
        position: absolute;
        width: 96px; height: 64px;
        border: 1px solid ${T.cardBorder};
        border-radius: 10px;
        background: linear-gradient(160deg, ${T.cardBg}, rgba(15, 23, 42, 0.4));
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
      }
      .module::before {
        content: "";
        position: absolute;
        top: 14px; left: 14px;
        width: 18px; height: 4px;
        border-radius: 2px;
        background: ${T.accent};
        opacity: 0.75;
      }
      .module::after {
        content: "";
        position: absolute;
        top: 26px; left: 14px;
        width: 56px; height: 3px;
        border-radius: 2px;
        background: rgba(148, 163, 184, 0.35);
      }
      .module .line2 {
        position: absolute;
        top: 36px; left: 14px;
        width: 40px; height: 3px;
        border-radius: 2px;
        background: rgba(148, 163, 184, 0.22);
      }
      .module .line3 {
        position: absolute;
        top: 46px; left: 14px;
        width: 64px; height: 3px;
        border-radius: 2px;
        background: rgba(148, 163, 184, 0.18);
      }
      .m1 { top: 200px; left: 320px; transform: rotate(-3deg); }
      .m2 { top: 188px; left: 444px; transform: rotate(2deg); }
      .m3 { top: 268px; left: 322px; transform: rotate(1deg); }
      .m4 { top: 280px; left: 458px; transform: rotate(-2deg); }

      .hub {
        position: absolute;
        left: 660px;
        top: 244px;
        width: 88px; height: 88px;
        transform: translate(-50%, -50%) translate(44px, 44px);
      }
      .hub-shape {
        width: 88px; height: 88px;
        background: linear-gradient(135deg, ${T.accent}, ${T.accentDark});
        clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
        box-shadow: 0 0 36px rgba(34, 211, 238, 0.45);
      }
      .hub-inner {
        position: absolute;
        inset: 6px;
        background: ${T.bgDeep.b};
        clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
        display: flex; align-items: center; justify-content: center;
        font-family: "Space Grotesk", sans-serif;
        font-weight: 700;
        font-size: 26px;
        color: ${T.accent};
        letter-spacing: -1px;
      }

      .endpoint {
        position: absolute;
        border: 1.5px solid ${T.bridgeLine};
        background: ${T.cardBgSubtle};
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
      }
      .endpoint-label {
        position: absolute;
        font-family: "Inter", sans-serif;
        font-size: 11px;
        font-weight: 500;
        color: ${T.textTertiary};
        letter-spacing: 0.4px;
        text-transform: uppercase;
      }
      /* IG hint — square */
      .ep-ig { left: 1040px; top: 162px; width: 56px; height: 56px; border-radius: 8px; }
      .ep-ig-grid {
        position: absolute; inset: 8px;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(3, 1fr);
        gap: 3px;
      }
      .ep-ig-grid > span { background: rgba(148, 163, 184, 0.32); border-radius: 1px; }
      .lbl-ig { left: 1040px; top: 222px; }

      /* LinkedIn hint — wide banner */
      .ep-li { left: 1024px; top: 268px; width: 88px; height: 36px; border-radius: 6px; padding: 8px; display:flex; align-items:center; gap:6px; }
      .ep-li-avatar { width: 18px; height: 18px; border-radius: 50%; background: rgba(148, 163, 184, 0.45); flex-shrink: 0; }
      .ep-li-bars { display: flex; flex-direction: column; gap: 3px; }
      .ep-li-bars span { display: block; height: 2.5px; background: rgba(148, 163, 184, 0.32); border-radius: 1px; }
      .ep-li-bars span:nth-child(1) { width: 38px; }
      .ep-li-bars span:nth-child(2) { width: 24px; }
      .lbl-li { left: 1024px; top: 308px; }

      /* X hint — abstract angular */
      .ep-x { left: 1056px; top: 348px; width: 36px; height: 36px; border-radius: 8px; opacity: 0.55; }
      .ep-x svg { width: 100%; height: 100%; }
      .ep-x svg line { stroke: ${T.textTertiary}; stroke-width: 2; }
      .lbl-x { left: 1052px; top: 388px; opacity: 0.55; }
    </style>
    <div class="scene">
      <!-- Connection lines (modules → hub, hub → endpoints) -->
      <svg style="position:absolute; inset:0; width:100%; height:100%;" viewBox="0 0 ${width} ${height}" fill="none">
        <defs>
          <linearGradient id="line-fade" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="${T.bridgeLine}" stop-opacity="0.1"/>
            <stop offset="60%" stop-color="${T.bridgeLine}" stop-opacity="0.65"/>
            <stop offset="100%" stop-color="${T.bridgeLine}" stop-opacity="0.85"/>
          </linearGradient>
          <linearGradient id="line-out" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="${T.bridgeLine}" stop-opacity="0.85"/>
            <stop offset="100%" stop-color="${T.bridgeLine}" stop-opacity="0.2"/>
          </linearGradient>
        </defs>
        <!-- module → hub feeders -->
        <path d="M 416 232 Q 540 262, 660 288" stroke="url(#line-fade)" stroke-width="1.6"/>
        <path d="M 540 220 Q 600 252, 660 288" stroke="url(#line-fade)" stroke-width="1.6"/>
        <path d="M 418 300 Q 540 300, 660 288" stroke="url(#line-fade)" stroke-width="1.6"/>
        <path d="M 554 312 Q 600 305, 660 288" stroke="url(#line-fade)" stroke-width="1.6"/>
        <!-- hub → endpoints -->
        <path d="M 748 268 Q 880 220, 1040 190" stroke="url(#line-out)" stroke-width="1.6"/>
        <path d="M 748 288 Q 880 290, 1024 286" stroke="url(#line-out)" stroke-width="1.6"/>
        <path d="M 740 312 Q 880 340, 1056 366" stroke="url(#line-out)" stroke-width="1.6" stroke-dasharray="4 4" opacity="0.6"/>
      </svg>

      <!-- 4 module blocks -->
      <div class="module m1"><div class="line2"></div><div class="line3"></div></div>
      <div class="module m2"><div class="line2"></div><div class="line3"></div></div>
      <div class="module m3"><div class="line2"></div><div class="line3"></div></div>
      <div class="module m4"><div class="line2"></div><div class="line3"></div></div>

      <!-- Central hub -->
      <div class="hub">
        <div class="hub-shape"></div>
        <div class="hub-inner">⌬</div>
      </div>

      <!-- 3 platform endpoints -->
      <div class="endpoint ep-ig">
        <div class="ep-ig-grid">
          <span></span><span></span><span></span>
          <span></span><span></span><span></span>
          <span></span><span></span><span></span>
        </div>
      </div>
      <div class="endpoint-label lbl-ig">IG</div>

      <div class="endpoint ep-li">
        <div class="ep-li-avatar"></div>
        <div class="ep-li-bars"><span></span><span></span></div>
      </div>
      <div class="endpoint-label lbl-li">LinkedIn</div>

      <div class="endpoint ep-x">
        <svg viewBox="0 0 36 36">
          <line x1="9" y1="9" x2="27" y2="27"/>
          <line x1="27" y1="9" x2="9" y2="27"/>
        </svg>
      </div>
      <div class="endpoint-label lbl-x">X (private)</div>
    </div>

    ${titleBlock(h)}
    ${tail()}`;
}

/* ════════════════════════════════════════════════════════════════════════
   PLATFORM-BRIDGE LAYOUT (L18a IG, L18b LinkedIn)

   Split: profile-card-hint (left) → bridge (center) → markdown-note-stack (right).
   Profile-card differs per platform; everything else is shared skeleton.
   ════════════════════════════════════════════════════════════════════════ */

function renderPlatformBridge(h) {
  const { width, height, profileCardShape, bridgeStyle } = h;

  // Profile-card-shape: IG square-grid OR LinkedIn horizontal-banner-with-posts
  const profileCardHtml =
    profileCardShape === "ig-grid"
      ? renderIgProfileCard()
      : renderLinkedInProfileCard();

  const bridgeHtml =
    bridgeStyle === "particle-stream"
      ? renderParticleStream(width, height)
      : renderTabularBridge(width, height);

  return `${baseHead({ width, height, intensity: "mid" })}
    <style>
      .scene { position: absolute; inset: 0; }

      /* Left profile-card zone (positioned in lower-mid-left) */
      .pc-zone {
        position: absolute;
        left: 80px;
        top: 220px;
        width: 360px;
        height: 320px;
      }

      /* Right markdown-note-stack zone (positioned mirror-right) */
      .md-zone {
        position: absolute;
        right: 80px;
        top: 220px;
        width: 360px;
        height: 320px;
      }
      .md-card {
        position: absolute;
        background: ${T.cardBg};
        border: 1px solid ${T.cardBorder};
        border-radius: 10px;
        padding: 16px 18px;
        box-shadow: 0 8px 28px rgba(0, 0, 0, 0.4);
        font-family: "Inter", sans-serif;
      }
      .md-card .filename {
        font-family: "Space Grotesk", sans-serif;
        font-size: 13px;
        font-weight: 600;
        color: ${T.textSecondary};
        letter-spacing: -0.2px;
        margin-bottom: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .md-card .filename .ext { color: ${T.accent}; }
      .md-yaml-line {
        height: 4px;
        border-radius: 2px;
        background: rgba(148, 163, 184, 0.32);
        margin-bottom: 6px;
      }
      .md-yaml-line.short { width: 50%; background: rgba(148, 163, 184, 0.22); }
      .md-yaml-line.mid { width: 70%; }
      .md-yaml-line.accent { background: rgba(34, 211, 238, 0.45); width: 35%; }
      .md-divider {
        height: 1px;
        background: rgba(148, 163, 184, 0.18);
        margin: 10px 0;
      }
      .md-h2 {
        height: 6px;
        width: 60%;
        background: ${T.textSecondary};
        border-radius: 3px;
        margin-bottom: 10px;
      }
      .md-body-line {
        height: 3px;
        border-radius: 2px;
        background: rgba(148, 163, 184, 0.24);
        margin-bottom: 5px;
      }
      .md-body-line.w90 { width: 90%; }
      .md-body-line.w75 { width: 75%; }
      .md-body-line.w60 { width: 60%; }
      .md-body-line.w45 { width: 45%; }

      .md-c1 { top: 0; right: 30px; width: 290px; height: 178px; transform: rotate(-1.5deg); z-index: 3; }
      .md-c2 { top: 80px; right: 0; width: 290px; height: 178px; transform: rotate(1.5deg); z-index: 2; opacity: 0.85; }
      .md-c3 { top: 158px; right: 60px; width: 290px; height: 130px; transform: rotate(-1deg); z-index: 1; opacity: 0.6; }

      ${profileCardCss()}
    </style>
    <div class="scene">
      <div class="pc-zone">${profileCardHtml}</div>
      ${bridgeHtml}
      <div class="md-zone">
        <div class="md-card md-c3">
          <div class="filename">2026-04-15-post-3.<span class="ext">md</span></div>
          <div class="md-body-line w90"></div>
          <div class="md-body-line w75"></div>
          <div class="md-body-line w60"></div>
          <div class="md-body-line w45"></div>
        </div>
        <div class="md-card md-c2">
          <div class="filename">2026-04-22-post-2.<span class="ext">md</span></div>
          <div class="md-yaml-line accent"></div>
          <div class="md-yaml-line"></div>
          <div class="md-yaml-line short"></div>
          <div class="md-divider"></div>
          <div class="md-h2"></div>
          <div class="md-body-line w90"></div>
          <div class="md-body-line w75"></div>
          <div class="md-body-line w60"></div>
        </div>
        <div class="md-card md-c1">
          <div class="filename">2026-04-26-post-1.<span class="ext">md</span></div>
          <div class="md-yaml-line accent"></div>
          <div class="md-yaml-line mid"></div>
          <div class="md-yaml-line short"></div>
          <div class="md-divider"></div>
          <div class="md-h2"></div>
          <div class="md-body-line w90"></div>
          <div class="md-body-line w75"></div>
          <div class="md-body-line w45"></div>
        </div>
      </div>
    </div>
    ${titleBlock(h)}
    ${tail()}`;
}

function profileCardCss() {
  return `
    /* IG-grid */
    .ig-card {
      position: absolute;
      width: 320px;
      height: 320px;
      background: ${T.cardBg};
      border: 1px solid ${T.cardBorder};
      border-radius: 14px;
      padding: 18px;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.5);
    }
    .ig-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
    .ig-avatar {
      width: 44px; height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, ${T.accent}, ${T.accentDark});
      box-shadow: 0 0 14px rgba(34, 211, 238, 0.5);
    }
    .ig-handle { display: flex; flex-direction: column; gap: 5px; }
    .ig-handle-line { height: 5px; background: rgba(148, 163, 184, 0.42); border-radius: 3px; }
    .ig-handle-line.l1 { width: 110px; }
    .ig-handle-line.l2 { width: 70px; background: rgba(148, 163, 184, 0.22); height: 4px; }
    .ig-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(3, 1fr);
      gap: 6px;
      height: 222px;
    }
    .ig-grid > span {
      background: linear-gradient(160deg, rgba(34, 211, 238, 0.18), rgba(14, 116, 144, 0.12));
      border-radius: 4px;
      border: 1px solid rgba(148, 163, 184, 0.10);
    }
    .ig-grid > span:nth-child(1) { background: linear-gradient(135deg, rgba(34, 211, 238, 0.32), rgba(14, 116, 144, 0.18)); }
    .ig-grid > span:nth-child(5) { background: linear-gradient(135deg, rgba(34, 211, 238, 0.28), rgba(14, 116, 144, 0.14)); }
    .ig-grid > span:nth-child(7) { background: linear-gradient(135deg, rgba(34, 211, 238, 0.22), rgba(14, 116, 144, 0.10)); }

    /* LinkedIn-banner-card */
    .li-card {
      position: absolute;
      width: 340px;
      height: 320px;
      background: ${T.cardBg};
      border: 1px solid ${T.cardBorder};
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.5);
    }
    .li-banner {
      width: 100%;
      height: 70px;
      background: linear-gradient(120deg, ${T.accentDark}, ${T.accent}, ${T.accentDark});
      opacity: 0.6;
    }
    .li-avatar {
      position: absolute;
      top: 42px; left: 22px;
      width: 56px; height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, ${T.accent}, ${T.accentDark});
      border: 3px solid ${T.cardBg};
      box-shadow: 0 0 14px rgba(34, 211, 238, 0.4);
    }
    .li-name {
      position: absolute;
      top: 110px; left: 22px;
      display: flex; flex-direction: column; gap: 6px;
    }
    .li-name-line { height: 6px; background: rgba(148, 163, 184, 0.45); border-radius: 3px; }
    .li-name-line.l1 { width: 140px; }
    .li-name-line.l2 { width: 90px; background: rgba(148, 163, 184, 0.25); height: 4px; }
    .li-posts {
      position: absolute;
      top: 162px; left: 18px; right: 18px;
      display: flex; flex-direction: column; gap: 10px;
    }
    .li-post {
      padding: 10px 12px;
      background: rgba(15, 23, 42, 0.55);
      border: 1px solid rgba(148, 163, 184, 0.10);
      border-radius: 8px;
      display: flex; flex-direction: column; gap: 4px;
    }
    .li-post-line { height: 3px; background: rgba(148, 163, 184, 0.25); border-radius: 2px; }
    .li-post-line.head { width: 70%; background: rgba(148, 163, 184, 0.4); height: 4px; }
    .li-post-line.l1 { width: 92%; }
    .li-post-line.l2 { width: 68%; }
  `;
}

function renderIgProfileCard() {
  return `
    <div class="ig-card">
      <div class="ig-header">
        <div class="ig-avatar"></div>
        <div class="ig-handle">
          <div class="ig-handle-line l1"></div>
          <div class="ig-handle-line l2"></div>
        </div>
      </div>
      <div class="ig-grid">
        <span></span><span></span><span></span>
        <span></span><span></span><span></span>
        <span></span><span></span><span></span>
      </div>
    </div>`;
}

function renderLinkedInProfileCard() {
  return `
    <div class="li-card">
      <div class="li-banner"></div>
      <div class="li-avatar"></div>
      <div class="li-name">
        <div class="li-name-line l1"></div>
        <div class="li-name-line l2"></div>
      </div>
      <div class="li-posts">
        <div class="li-post">
          <div class="li-post-line head"></div>
          <div class="li-post-line l1"></div>
          <div class="li-post-line l2"></div>
        </div>
        <div class="li-post">
          <div class="li-post-line head"></div>
          <div class="li-post-line l1"></div>
        </div>
      </div>
    </div>`;
}

/* Bridge: particle stream — dots flowing on a curved path */
function renderParticleStream(width, height) {
  const dots = [];
  const xStart = 460;
  const xEnd = 820;
  const count = 24;
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const x = xStart + (xEnd - xStart) * t;
    // Sinusoidal y-curve, plus slight randomness
    const yBase = 380;
    const y = yBase - Math.sin(t * Math.PI * 1.2) * 70 - (1 - t) * 30;
    const r = 2 + (1 - Math.abs(t - 0.5) * 2) * 2.2; // larger in middle
    const opacity = 0.35 + (1 - Math.abs(t - 0.5) * 2) * 0.55;
    dots.push(
      `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="${T.accent}" opacity="${opacity.toFixed(2)}"/>`
    );
  }
  return `<svg style="position:absolute; left:0; top:0;" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
    <defs>
      <radialGradient id="dot-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${T.accent}" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="${T.accent}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <ellipse cx="640" cy="380" rx="180" ry="40" fill="url(#dot-glow)" opacity="0.4"/>
    ${dots.join("\n    ")}
  </svg>`;
}

/* Bridge: tabular rows — structured horizontal bars suggesting data flow */
function renderTabularBridge(width, height) {
  const rows = 5;
  const lines = [];
  for (let i = 0; i < rows; i++) {
    const y = 320 + i * 26;
    const startX = 460 + i * 8;
    const endX = 820 - (rows - 1 - i) * 6;
    const opacity = 0.25 + i * 0.13;
    lines.push(
      `<line x1="${startX}" y1="${y}" x2="${endX}" y2="${y}" stroke="${T.accent}" stroke-width="2" stroke-linecap="round" opacity="${opacity.toFixed(2)}"/>`
    );
    // small "data dot" terminating each row
    lines.push(
      `<circle cx="${endX + 6}" cy="${y}" r="2.5" fill="${T.accent}" opacity="${(opacity + 0.1).toFixed(2)}"/>`
    );
  }
  return `<svg style="position:absolute; left:0; top:0;" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
    ${lines.join("\n    ")}
  </svg>`;
}

/* ════════════════════════════════════════════════════════════════════════
   Main loop
   ════════════════════════════════════════════════════════════════════════ */

const browser = await chromium.launch();

for (const hero of heroes) {
  const html =
    hero.layout === "library-banner"
      ? renderLibraryBanner(hero)
      : renderPlatformBridge(hero);

  const context = await browser.newContext({
    viewport: { width: hero.width, height: hero.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);

  const outPath = resolve(ROOT, hero.dest);
  await mkdir(dirname(outPath), { recursive: true });
  await page.screenshot({
    path: outPath,
    type: "png",
    fullPage: false,
    clip: { x: 0, y: 0, width: hero.width, height: hero.height },
  });
  await context.close();

  const s = await stat(outPath);
  const kb = (s.size / 1024).toFixed(1);
  const ok = s.size <= hero.maxKB * 1024 ? "OK" : "OVER";
  console.log(`[${ok}] ${hero.label}`);
  console.log(`       ${hero.dest}  ${hero.width}x${hero.height}  ${kb} KB  (limit ${hero.maxKB} KB)`);
  if (s.size > hero.maxKB * 1024) {
    console.warn("       WARNING: exceeds limit");
  }
}

await browser.close();
console.log(`\nDone. ${heroes.length} hero(es) generated.`);
