import fs from "fs";
import path from "path";
import {
  Cpu,
  FileText,
  Brain,
  Shield,
  TestTubeDiagonal,
  Users,
  Clock,
  Globe,
  TrendingUp,
  Terminal,
  ExternalLink,
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Nav from "@/components/Nav";
import Logo from "@/components/Logo";
import EmailObfuscator from "@/components/EmailObfuscator";
import StatsGrid, { type StatsData } from "@/components/StatsGrid";
import FounderImage from "@/components/FounderImage";
import LiveTicker from "@/components/LiveTicker";
import { BRAND } from "@/lib/brand";

/* Code-split client components — separate chunks, not in main bundle */
const CookieBanner = dynamic(() => import("@/components/CookieBanner"));
const ImageModal = dynamic(() => import("@/components/ImageModal"));

/* ---------- constants ---------- */

const showOssLaunch = process.env.OSS_LAUNCH_VISIBLE === "true";

// GEO snippets: long-form Q&A for AI crawler citation + FAQPage JSON-LD extension.
// Visible as standalone sections on page; also merged into the FAQPage JSON-LD.
const snippetItems = [
  {
    q: "Was ist Nearshore-Entwicklung?",
    a: "Nearshore-Entwicklung bezeichnet die Auslagerung von Software-Entwicklung an einen Partner in geografischer und kultureller Nähe. Neckarshore AI operiert von Stuttgart aus im DACH-Raum: gleiche Zeitzone, gleiche Sprache, gleiche DSGVO-Standards. Im Unterschied zu Offshore entfallen Kommunikationsverluste und Compliance-Risiken durch Datentransfer in Drittstaaten. Im Unterschied zu klassischen deutschen IT-Dienstleistern bringt Neckarshore AI KI-Beschleunigung — ein fokussiertes Team mit modernen AI-Tools liefert, wofür andere ein Vielfaches an Personen einsetzen.",
  },
  {
    q: "Wie funktioniert KI-beschleunigte Softwareentwicklung?",
    a: "KI-beschleunigte Softwareentwicklung bei Neckarshore AI folgt einem Prinzip: Menschen denken, entscheiden und verantworten — KI exekutiert nach klaren Leitplanken. Spezialisierte KI-Agenten implementieren, testen, dokumentieren und deployen parallel. Jedes Ergebnis wird vom Senior-Engineer reviewed und freigegeben. Die Geschwindigkeit entsteht durch Parallelisierung — während der Engineer die nächste Anforderung klärt, implementiert die KI die letzte. Qualitätssicherung, automatisierte Tests und OWASP-Compliance bleiben vollständig menschlich kontrolliert.",
  },
  {
    q: "Was ist BYOLLM?",
    a: "BYOLLM steht für Bring Your Own LLM — ein Architekturprinzip von Neckarshore AI, das Kunden die volle Kontrolle über ihr KI-Modell gibt. Statt an einen Anbieter gebunden zu sein, bringt der Kunde sein bevorzugtes Modell mit (Claude, GPT-4, Gemini oder lokale Open-Source-Modelle). Kundendaten verlassen nie die eigene Infrastruktur — DSGVO-konform by default. Beim Omnopsis Documentor+X ist BYOLLM der Standard, nicht eine Option. Fail-closed: wenn das Modell keine sichere Antwort findet, gibt es keine aus.",
  },
];

const faqItems = [
  {
    q: `Was ist ${BRAND.PRODUCT_SHORT}?`,
    a: `${BRAND.PRODUCT_NAME} ist unsere KI-first Documentation Engine. Sie zieht automatisch aus Git, Jira und Confluence und generiert Compliance-Doku, technische Doku und rollenbasierte Chatbot-Antworten. Fail-closed: Wenn die Evidenz schwach ist, verweigert das System die Antwort — lieber schweigen als lügen.`,
  },
  {
    q: "Was bedeutet BYOLLM?",
    a: "BYOLLM steht für Bring Your Own LLM. Bei neckarshore.ai entscheidet der Kunde, welches Sprachmodell eingesetzt wird. Eure Daten verlassen euer Haus nicht, ihr kontrolliert die Kosten und seid an keinen Anbieter gebunden.",
  },
  {
    q: "Was kostet Nearshore-Entwicklung bei neckarshore.ai?",
    a: "Wir sind deutlich kosteneffektiver als Big-4-Consultancies bei vergleichbarer Qualität. Durch KI-Beschleunigung liefert ein kleines Team, wofür andere deutlich mehr Leute brauchen. Konkrete Preise besprechen wir im 15-Minuten Kennenlerntermin.",
  },
  {
    q: "Wo sitzt neckarshore.ai?",
    a: "neckarshore.ai sitzt in Stuttgart, Deutschland. Der Name kommt vom Neckar — dem Fluss, der das industrielle Herz Baden-Württembergs verbindet. Wir arbeiten remote-first, sind aber lokal verankert: gleiche Zeitzone, gleiche Sprache, gleiche Datenschutzstandards.",
  },
  {
    q: "Ist neckarshore.ai DSGVO-konform?",
    a: "Ja, DSGVO-Konformität ist bei uns Architekturentscheidung, keine Checkliste. Hosting in Deutschland, Verschlüsselung, Tenant-Isolation, und BYOLLM — eure Daten bleiben bei euch. Diese Website setzt keine Tracking-Cookies und lädt keine externen Ressourcen.",
  },
];

function getDaysSinceStart(): number {
  const now = new Date();
  const diff = now.getTime() - BRAND.DAY_ONE.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function loadStats(): StatsData {
  const statsPath = path.join(process.cwd(), "public", "stats.json");
  try {
    return JSON.parse(fs.readFileSync(statsPath, "utf-8"));
  } catch {
    return {
      days: 17,
      commits: 780,
      tests: 464,
      endpoints: 92,
      linesOfCode: 95000,
      repos: 13,
      updatedAt: "",
    };
  }
}

/* ---------- page ---------- */

export default function Home() {
  const devDays = getDaysSinceStart();
  const stats = loadStats();
  return (
    <>
      <Nav />
      <main>
        {/* ===== HERO ===== */}
        <section className="relative overflow-hidden bg-neutral-light px-4 pt-32 pb-20 md:px-6 md:pt-40 md:pb-24 dark:bg-deep-space">
          <div className="mx-auto max-w-[1200px]">
            <h1 className="font-heading text-4xl font-bold leading-[1.1] tracking-tight text-primary md:text-[56px] dark:text-text-primary">
              Software Development.
              <br />
              Closer to Home.
            </h1>
            <p className="mt-3 text-sm font-medium text-muted dark:text-text-secondary/70">
              <strong>Neckarshore AI</strong> — KI-beschleunigte Nearshore-Softwareentwicklung aus Stuttgart.
            </p>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-dark/80 md:text-xl dark:text-text-secondary">
              neckarshore.ai bringt KI-beschleunigte Softwareentwicklung zurück nach Stuttgart.
              Gleiche Zeitzone, gleiche Sprache, gleiche Datenschutzstandards — ohne Offshore-Risiko,
              ohne Big-4-Preise.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="https://calendly.com/rauhut/20min"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg bg-accent px-8 py-3.5 text-base font-medium text-white transition-all duration-150 hover:bg-accent-hover hover:scale-[1.02] active:scale-[0.98]"
                data-track="cta_click"
              >
                Kennenlerntermin buchen
              </a>
              <a
                href="#services"
                className="inline-flex items-center justify-center rounded-lg border-2 border-primary px-8 py-3.5 text-base font-medium text-primary transition-all duration-150 hover:bg-primary hover:text-white dark:border-text-primary dark:text-text-primary dark:hover:bg-text-primary dark:hover:text-deep-space"
              >
                Unsere Services
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm font-medium tracking-wide text-muted dark:text-text-secondary/60">
              <span className="flex items-center gap-2">
                <Shield size={16} className="text-accent" />
                DSGVO-by-Design
              </span>
              <span className="flex items-center gap-2">
                <Globe size={16} className="text-accent" />
                Made in Germany
              </span>
              <span className="flex items-center gap-2">
                <Cpu size={16} className="text-accent" />
                AI-Powered
              </span>
            </div>
          </div>
          {/* Decorative gradient blob */}
          <div
            className="pointer-events-none absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full opacity-[0.07] dark:opacity-[0.12]"
            style={{
              background:
                "radial-gradient(circle, #00D4FF 0%, transparent 70%)",
            }}
          />
        </section>

        {/* ===== HERO TEASER — bordeaux strip, remove ~3 weeks after Vault Autopilot launch ===== */}
        {showOssLaunch && (
        <>
        <div className="bg-[#5C1A2A] px-4 py-3 md:px-6">
          <div className="mx-auto flex max-w-[1200px] items-center justify-center gap-3 text-sm text-[#F5C6D0] md:text-base">
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
              Neu
            </span>
            <span>
              Obsidian Vault Autopilot — unser erstes Open-Source-Projekt ist live.
            </span>
            <a
              href="#open-source"
              className="shrink-0 font-medium text-white transition-colors hover:text-[#F5C6D0]"
              data-track="hero_teaser_oss"
            >
              Zum Projekt&nbsp;&rarr;
            </a>
          </div>
        </div>

        {/* ===== OPEN SOURCE CARD — temporary hero placement, move to permanent section after ~3 weeks ===== */}
        <section id="open-source" className="bg-neutral-light px-4 py-16 md:px-6 md:py-20 dark:bg-deep-space">
          <div className="mx-auto max-w-[600px]">
            <p className="text-center text-sm font-semibold uppercase tracking-widest text-accent">
              Open Source
            </p>
            <h2 className="mt-3 text-center font-heading text-2xl font-semibold tracking-tight text-primary md:text-3xl dark:text-text-primary">
              Tools die wir selbst benutzen. Jetzt auch für euch.
            </h2>

            {/* Vault Autopilot Card */}
            <div className="mt-10 flex flex-col rounded-xl border border-primary/10 bg-white p-8 shadow-sm dark:border-text-secondary/10 dark:bg-surface">
              <div className="flex items-center gap-3">
                <Terminal size={28} className="text-secondary" />
                <span className="rounded-full bg-accent/10 px-3 py-0.5 text-xs font-semibold text-accent dark:bg-accent/20">
                  Beta
                </span>
              </div>
              <h3 className="mt-4 font-heading text-xl font-semibold text-primary dark:text-text-primary">
                Obsidian Vault Autopilot
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
                Claude Code Plugin das dein Second Brain aufräumt — sortiert,
                benennt um, verbessert die Qualität deiner Notes &amp; sorgt für saubere Properties.
              </p>

              <div className="mt-5 space-y-2">
                <div className="flex items-start gap-3">
                  <code className="inline-block w-[120px] shrink-0 rounded bg-primary/5 px-2 py-0.5 text-center text-xs font-semibold text-accent dark:bg-text-secondary/10">
                    note-rename
                  </code>
                  <span className="text-sm text-neutral-dark/70 dark:text-text-secondary/70">
                    Benennt um, fixt alle Backlinks im Vault.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <code className="inline-block w-[120px] shrink-0 rounded bg-primary/5 px-2 py-0.5 text-center text-xs font-semibold text-accent dark:bg-text-secondary/10">
                    inbox-sort
                  </code>
                  <span className="text-sm text-neutral-dark/70 dark:text-text-secondary/70">
                    Analysiert Inhalt, verschiebt in den richtigen Ordner.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <code className="inline-block w-[120px] shrink-0 rounded bg-primary/5 px-2 py-0.5 text-center text-xs font-semibold text-accent/50 italic dark:bg-text-secondary/10">
                    more coming…
                  </code>
                  <span className="text-sm text-neutral-dark/50 italic dark:text-text-tertiary">
                    Watch this space.
                  </span>
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between pt-6">
                <span className="text-xs font-medium text-muted dark:text-text-tertiary">
                  MIT License
                </span>
                <a
                  href="https://github.com/neckarshore-ai/obsidian-vault-autopilot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] dark:bg-text-primary dark:text-deep-space dark:hover:bg-text-primary/90"
                  data-track="oss_vault_autopilot"
                >
                  GitHub
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        </section>
        </>
        )}

        {/* ===== WHY NEARSHORE ===== */}
        <section id="why-nearshore" className="bg-white px-4 py-20 md:px-6 md:py-24 dark:bg-surface">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-primary md:text-4xl dark:text-text-primary">
              Warum Nearshore?
            </h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: Clock,
                  title: "vs. Offshore",
                  subtitle: "All the speed, none of the risk.",
                  text: "Gleiche Zeitzone, gleiche Sprache. neckarshore.ai liefert DSGVO-konform by default, KI-beschleunigt, mit kulturellem Alignment — wir verstehen wie deutsche Unternehmen ticken.",
                },
                {
                  icon: TrendingUp,
                  title: "vs. Big-4",
                  subtitle: "Enterprise-Qualität ohne Enterprise-Preise.",
                  text: "Deutlich kosteneffektiver bei vergleichbarer Qualität. Schnellere Delivery, weniger Overhead. Direkter Zugang zu Engineers — kein Junior-heavy Bench-Modell.",
                },
                {
                  icon: Users,
                  title: "vs. Freelancers",
                  subtitle: "Die Verlässlichkeit einer Agentur, die Agilität eines Startups.",
                  text: "Skalierbar, nicht einzelne Person. Strukturierte Prozesse, nicht ad-hoc. Volle Projektverantwortung mit konsistenten Qualitätsstandards.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="group rounded-xl border-l-4 border-accent bg-neutral-light p-8 shadow-sm transition-all duration-250 hover:-translate-y-0.5 hover:shadow-md dark:bg-deep-space"
                >
                  <item.icon size={32} className="text-secondary" />
                  <h3 className="mt-4 font-heading text-xl font-semibold text-primary md:text-2xl dark:text-text-primary">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-accent dark:text-accent-bright">{item.subtitle}</p>
                  <p className="mt-3 leading-relaxed text-neutral-dark/80 dark:text-text-secondary">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== SERVICES ===== */}
        <section id="services" className="bg-neutral-light px-4 py-20 md:px-6 md:py-24 dark:bg-deep-space">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-primary md:text-4xl dark:text-text-primary">
              Unsere Services
            </h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Cpu,
                  title: "AI-Powered Development",
                  subtitle: "Software, schneller gebaut.",
                  text: "Wir bauen eure Software mit KI-Beschleunigung. Ein kleines Team mit modernen AI-Tools liefert, wofür andere 3x so viele Leute brauchen. NestJS, TypeScript, PostgreSQL — kein Spielzeug, sondern Production-Stack.",
                },
                {
                  icon: FileText,
                  title: "Documentation Automation",
                  subtitle: "Doku, die sich selbst schreibt.",
                  text: `Unser Flaggschiff-Produkt ${BRAND.PRODUCT_SHORT} generiert automatisch Compliance-Doku, technische Doku und Chatbot-Antworten aus eurem Git, Jira und Confluence. Fail-closed: lieber schweigen als lügen.`,
                },
                {
                  icon: Brain,
                  title: "AI Consulting & Strategy",
                  subtitle: "KI richtig einsetzen.",
                  text: "Welches LLM passt? Wo lohnt sich Automatisierung? Was ist Hype, was ist real? Wir beraten DACH-Unternehmen bei KI-Strategie — aus Erfahrung, nicht aus Folien.",
                },
                {
                  icon: Shield,
                  title: "DSGVO-by-Design",
                  subtitle: "Datenschutz als Architektur.",
                  text: "BYOLLM: Eure Daten verlassen euer Haus nicht. Hosting in Deutschland. Verschlüsselung. Tenant-Isolation. DSGVO ist bei uns keine Checkliste, sondern Architekturentscheidung.",
                },
                {
                  icon: TestTubeDiagonal,
                  title: "Quality Engineering",
                  subtitle: "Testen, bevor es knallt.",
                  text: "Hunderte automatisierte Tests, OWASP LLM Top 10, EU AI Act Compliance, Golden Datasets. Wir testen KI-Systeme mit derselben Strenge wie klassische Software — plus AI-spezifische Dimensionen.",
                },
                {
                  icon: Users,
                  title: "Nearshore Partnership",
                  subtitle: "Euer Team, erweitert.",
                  text: "Gleiche Zeitzone, gleiche Sprache, gleiche Datenschutzstandards. Kein Offshore-Risiko, keine Big-4-Preise. Stuttgart-basiert, remote-first, skalierbar.",
                },
              ].map((service) => (
                <div
                  key={service.title}
                  className="group rounded-xl bg-white p-8 shadow-[0_10px_30px_rgba(10,37,64,0.08)] transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(10,37,64,0.14)] dark:bg-surface dark:shadow-none dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
                >
                  <service.icon size={32} className="text-secondary" />
                  <h3 className="mt-4 font-heading text-lg font-semibold text-primary md:text-xl dark:text-text-primary">
                    {service.title}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-accent dark:text-accent-bright">{service.subtitle}</p>
                  <p className="mt-3 text-[15px] leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
                    {service.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== OMNOPSIS TEASER (Title-Case rendering — see src/lib/brand.ts) ===== */}
        <section id={BRAND.SECTION_ID} className="bg-primary px-4 py-20 md:px-6 md:py-24">
          <div className="mx-auto max-w-[1200px]">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-secondary">
                  Unser Flaggschiff
                </p>
                <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-text-primary md:text-4xl">
                  {BRAND.PRODUCT_NAME}
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-text-secondary">
                  KI-first Documentation Engine. Zieht automatisch aus Git, Jira und Confluence —
                  generiert Compliance-Doku, technische Doku und rollenbasierte Chatbot-Antworten.
                </p>
                <p className="mt-4 text-lg leading-relaxed text-text-secondary">
                  BYOLLM: Eure Daten verlassen euer Haus nicht.
                  <br />
                  Fail-closed: lieber schweigen als lügen.
                </p>
                <p className="mt-6 text-sm font-mono text-text-secondary/70">
                  <ImageModal
                    src="/images/omnixis-conceived-whiteboard-2024-12-11.jpg"
                    alt={`${BRAND.PRODUCT_SHORT} Whiteboard-Skizze, Sindelfingen, Dezember 2024`}
                    className="inline-flex min-h-[24px] items-center cursor-pointer text-secondary underline decoration-secondary/30 underline-offset-2 transition-colors hover:text-text-primary hover:decoration-secondary"
                  >
                    Conceived
                  </ImageModal>
                  {" "}December 11, 2024 in Sindelfingen.
                  <br />
                  <ImageModal
                    src="/images/omnixis-born-first-session-2026-03-22.png"
                    alt={`Erste ${BRAND.PRODUCT_SHORT} Claude Code Session, März 2026`}
                    className="inline-flex min-h-[24px] items-center cursor-pointer text-secondary underline decoration-secondary/30 underline-offset-2 transition-colors hover:text-text-primary hover:decoration-secondary"
                  >
                    Born
                  </ImageModal>
                  {" "}March 22, 2026 in Stuttgart.
                  <br />
                  MVP Q2 2026.
                  <br />
                  LIVE Q3 2026.
                </p>
              </div>

              {/* Stats grid — renders instantly with fallback, fetches live data in background */}
              <StatsGrid stats={stats} devDays={devDays} />
            </div>
          </div>
        </section>

        {/* ===== OPEN SOURCE (permanent section — currently inactive, card is in hero placement above)
             TODO: Move card back here after launch promotion period (~3 weeks) ===== */}

        {/* ===== FOUNDER ===== */}
        <section id="founder" className="bg-white px-4 py-20 md:px-6 md:py-24 dark:bg-surface">
          <div className="mx-auto max-w-[1200px]">
            <div className="grid items-start gap-12 md:grid-cols-[280px_1fr]">
              <FounderImage />

              <div>
                <h2 className="font-heading text-3xl font-semibold tracking-tight text-primary md:text-4xl dark:text-text-primary">
                  German Rauhut
                </h2>
                <p className="mt-1 text-lg font-medium text-accent dark:text-accent-bright">
                  Gründer, neckarshore.ai
                </p>
                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
                  Ehemaliger Mercedes-Benz IT — jetzt Gründer von Neckarshore AI in Stuttgart. Ich
                  baue Software mit KI-Beschleunigung und automatisiere alles, was keiner machen will.
                  Mein Flaggschiff {BRAND.PRODUCT_SHORT} dokumentiert sich selbst — weil niemand Doku schreiben will,
                  aber alle meckern wenn keine da ist.
                </p>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
                  Ein Entwickler, mehrere KI-Assistenten, und die Überzeugung dass Kontext das neue
                  Öl (in alten Schläuchen) ist.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ===== MASCHIN + S-Team — full-width teal band ===== */}
        <section className="bg-[#B2F0FF] px-4 py-20 md:px-6 md:py-24 dark:bg-[#1A4D5C]">
          <div className="mx-auto max-w-[1200px]">
            <div className="grid items-start gap-12 md:grid-cols-[280px_1fr]">
              <div className="mx-auto overflow-hidden rounded-2xl md:mx-0">
                <Image
                  src="/images/neckarshore-ai-expert-system.jpg"
                  alt="KI-Expertensystem von neckarshore.ai — spezialisierte AI-Agenten für Architektur, Quality Engineering, Dokumentation und Deployment"
                  width={288}
                  height={288}
                  sizes="288px"
                  className="rounded-2xl object-cover"
                  loading="lazy"
                />
              </div>

              <div>
                <h2 className="font-heading text-3xl font-semibold tracking-tight text-primary md:text-4xl dark:text-text-primary">
                  Unser Ansatz
                </h2>
                <p className="mt-1 text-lg font-medium text-primary/70 dark:text-accent-bright">
                  Enterprise-Qualität ohne Enterprise-Headcount
                </p>
                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-primary/80 dark:text-text-secondary">
                  Ein Senior-Architekt mit 20 Jahren Enterprise-Erfahrung, unterstützt durch ein
                  KI-gestütztes Expertensystem — spezialisiert auf Architektur, Quality Engineering,
                  Dokumentation und Deployment. Jede Disziplin wird von einer dedizierten KI abgedeckt,
                  eingebettet in einen strukturierten Engineering-Prozess.
                </p>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-primary/80 dark:text-text-secondary">
                  Das Ergebnis: Delivery-Geschwindigkeit und -Breite, die normalerweise ein ganzes Team
                  erfordert. Ein Mensch denkt, entscheidet und verantwortet. Die KI exekutiert nach
                  klaren Leitplanken.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section id="cta" className="bg-neutral-light px-4 py-20 md:px-6 md:py-24 dark:bg-deep-space">
          <div className="mx-auto max-w-[700px] text-center">
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-primary md:text-4xl dark:text-text-primary">
              Bereit, näher zusammenzuarbeiten?
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
              20 Minuten Kennenlerntermin — wir reden über euer Projekt, nicht über unsere Folien.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a
                href="https://calendly.com/rauhut/20min"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg bg-accent px-8 py-3.5 text-base font-medium text-white transition-all duration-150 hover:bg-accent-hover hover:scale-[1.02] active:scale-[0.98]"
                data-track="cta_click"
              >
                Kennenlerntermin buchen
              </a>
              <span className="text-muted dark:text-text-tertiary">oder</span>
              <EmailObfuscator />
            </div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section id="faq" className="bg-white px-4 py-20 md:px-6 md:py-24 dark:bg-surface">
          <div className="mx-auto max-w-[800px]">
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-primary md:text-4xl dark:text-text-primary">
              Häufige Fragen
            </h2>
            <div className="mt-12 space-y-6">
              {faqItems.map((item, i) => (
                <details
                  key={i}
                  className="group rounded-xl border border-primary/10 bg-neutral-light p-6 open:bg-white open:shadow-sm dark:border-text-secondary/10 dark:bg-deep-space dark:open:bg-surface"
                >
                  <summary className="cursor-pointer font-heading text-lg font-semibold text-primary list-none flex items-center justify-between dark:text-text-primary">
                    {item.q}
                    <span className="ml-4 text-accent transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-4 leading-relaxed text-neutral-dark/80 dark:text-text-secondary">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
          <script
            type="application/ld+json"
            // Safe: static FAQ + snippet data, no user input — AD-19 compliant
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: [...faqItems, ...snippetItems].map((item) => ({
                  "@type": "Question",
                  name: item.q,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: item.a,
                  },
                })),
              }),
            }}
          />
        </section>

        {/* ===== KNOWLEDGE BASE — GEO-optimierte Long-Form-Snippets für AI-Crawler-Citability ===== */}
        <section className="bg-neutral-light px-4 py-20 md:px-6 md:py-24 dark:bg-deep-space">
          <div className="mx-auto max-w-[800px] space-y-16">

            <div>
              <h3 className="font-heading text-2xl font-semibold tracking-tight text-primary dark:text-text-primary">
                Was ist Nearshore-Entwicklung?
              </h3>
              <p className="mt-4 leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
                Nearshore-Entwicklung bezeichnet die Auslagerung von Software-Entwicklung an einen Partner
                in geografischer und kultureller Nähe — im Gegensatz zu Offshore (günstig, aber weit und
                riskant) und zu klassischem Onshore (nah, aber teuer). Neckarshore AI operiert von Stuttgart
                aus im DACH-Raum: gleiche Zeitzone (CET/CEST), gleiche Sprache, gleiche DSGVO-Standards by
                default. Das eliminiert die klassischen Offshore-Risiken: Kommunikationsverlust über
                Zeitzonen hinweg, schwierige Qualitätskontrolle auf Distanz und Compliance-Probleme durch
                Datentransfer in Drittstaaten. Im Unterschied zu klassischen deutschen IT-Dienstleistern
                bringt Neckarshore AI KI-Beschleunigung: ein kleines, fokussiertes Team mit modernen
                AI-Tools erreicht die Lieferfähigkeit, für die andere Teams ein Vielfaches an Personen
                einsetzen. Das Ergebnis: Enterprise-Qualität zu Nearshore-Preisen, mit vollem deutschen
                Datenschutzstandard, direktem Zugang zu Senior-Engineers statt Junior-lastigen
                Bench-Modellen, und schnellerer Delivery durch AI-Unterstützung in jedem Schritt des
                Entwicklungsprozesses.
              </p>
            </div>

            <div>
              <h3 className="font-heading text-2xl font-semibold tracking-tight text-primary dark:text-text-primary">
                Wie funktioniert KI-beschleunigte Softwareentwicklung?
              </h3>
              <p className="mt-4 leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
                KI-beschleunigte Softwareentwicklung bei Neckarshore AI folgt einem klaren Prinzip: Menschen
                denken, entscheiden und verantworten — KI exekutiert nach klaren Leitplanken. Der
                Entwicklungsprozess beginnt mit der Architekturentscheidung durch den Senior-Engineer.
                Danach übernehmen spezialisierte KI-Agenten das Implementieren, Testen, Dokumentieren und
                Deployen — parallel und ohne Wartezeit zwischen den Schritten. Jedes Ergebnis wird vom
                Menschen reviewed und freigegeben, bevor es in Produktion geht. Die
                Geschwindigkeitsmultiplikation entsteht durch Parallelisierung: während der Engineer die
                nächste Anforderung klärt, implementiert die KI die letzte Entscheidung und schreibt Tests
                für die Entscheidung davor. Für Kunden bedeutet das schnellere Delivery, weniger Overhead
                und direkten Zugang zu Senior-Engineers statt Junior-Bench-Modellen. Qualitätssicherung
                bleibt vollständig menschlich kontrolliert: automatisierte Tests, OWASP-Compliance und
                Code-Reviews folgen denselben Standards wie in klassischen Enterprise-Teams — nur schneller.
              </p>
            </div>

            <div>
              <h3 className="font-heading text-2xl font-semibold tracking-tight text-primary dark:text-text-primary">
                Was ist BYOLLM?
              </h3>
              <p className="mt-4 leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
                BYOLLM steht für Bring Your Own LLM — ein Architekturprinzip von Neckarshore AI, das
                Kunden die volle Kontrolle über ihr KI-Modell gibt. Anstatt an einen Cloud-LLM-Anbieter
                gebunden zu sein, bringt der Kunde sein bevorzugtes Modell mit: Claude von Anthropic, GPT-4
                von OpenAI, Gemini von Google oder ein lokal gehostetes Open-Source-Modell. Neckarshore AI
                liefert die Pipeline — Datenextraktion aus Git, Jira und Confluence, Aufbereitung,
                Qualitäts-Gates und strukturierte Ausgabe. Die Vorteile: Keine Kundendaten verlassen die
                eigene Infrastruktur (DSGVO-konform by default), keine Vendor-Lock-in-Abhängigkeit, volle
                Kostenkontrolle über Modell und Inferenzkosten. Beim Omnopsis Documentor+X, dem
                Flaggschiff-Produkt von Neckarshore AI, ist BYOLLM keine Option — es ist der Standard.
                Fail-closed bedeutet außerdem: wenn das Modell keine sichere Antwort findet, gibt es keine
                aus. Lieber schweigen als lügen.
              </p>
            </div>

          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-primary/5 bg-white px-4 py-10 md:px-6 dark:border-text-secondary/10 dark:bg-surface">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-4 text-sm text-muted md:flex-row md:justify-between dark:text-text-secondary/60">
          <Logo size="text-xl" className="text-primary/70 dark:text-text-secondary" />
          <div className="flex gap-6">
            <a href="/impressum" className="transition-colors hover:text-accent">
              Impressum
            </a>
            <a href="/datenschutz" className="transition-colors hover:text-accent">
              Datenschutz
            </a>
          </div>
          <p>
            &copy; 2026 neckarshore.ai — German Rauhut, IT Consulting &amp; Digital Ventures
          </p>
        </div>
        <div className="mt-4 flex flex-col items-center gap-1">
          <p className="text-center text-xs text-muted dark:text-text-tertiary">Stuttgart, Deutschland</p>
          <div className="text-muted dark:text-text-tertiary">
            <LiveTicker fetchedAt={new Date().toISOString()} />
          </div>
        </div>
      </footer>

      <CookieBanner />
    </>
  );
}
