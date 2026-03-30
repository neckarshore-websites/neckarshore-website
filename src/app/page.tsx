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
  GitCommit,
  FlaskConical,
  Layers,
  Code2,
  FolderGit2,
  CalendarDays,
} from "lucide-react";
import Nav from "@/components/Nav";
import CookieBanner from "@/components/CookieBanner";
import Logo from "@/components/Logo";
import TrackerScript from "@/components/TrackerScript";
import EmailObfuscator from "@/components/EmailObfuscator";
import LiveTicker from "@/components/LiveTicker";
import ImageModal from "@/components/ImageModal";
import { getGitHubStats } from "@/lib/github-stats";

/* ---------- constants ---------- */

const OMNIXIS_DAY_ONE = new Date("2026-03-22");

const faqItems = [
  {
    q: "Was ist OMNIXIS?",
    a: "OMNIXIS Documenter+X ist unsere KI-first Documentation Engine. Sie zieht automatisch aus Git, Jira und Confluence und generiert Compliance-Doku, technische Doku und rollenbasierte Chatbot-Antworten. Fail-closed: Wenn die Evidenz schwach ist, verweigert das System die Antwort — lieber schweigen als lügen.",
  },
  {
    q: "Was bedeutet BYOLLM?",
    a: "BYOLLM steht für Bring Your Own LLM. Bei neckarshore.ai entscheidet der Kunde, welches Sprachmodell eingesetzt wird. Eure Daten verlassen euer Haus nicht, ihr kontrolliert die Kosten und seid an keinen Anbieter gebunden.",
  },
  {
    q: "Was kostet Nearshore-Entwicklung bei neckarshore.ai?",
    a: "Wir sind 5-10x kosteneffektiver als Big-4-Consultancies bei vergleichbarer Qualität. Durch KI-Beschleunigung liefert ein kleines Team, wofür andere 3x so viele Leute brauchen. Konkrete Preise besprechen wir im 15-Minuten Kennenlerntermin.",
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
  const diff = now.getTime() - OMNIXIS_DAY_ONE.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/* ---------- page ---------- */

export default async function Home() {
  const devDays = getDaysSinceStart();
  const stats = await getGitHubStats();
  return (
    <>
      <Nav />
      <TrackerScript />

      <main>
        {/* ===== HERO ===== */}
        <section className="relative overflow-hidden bg-neutral-light px-4 pt-32 pb-20 md:px-6 md:pt-40 md:pb-24 dark:bg-deep-space">
          <div className="mx-auto max-w-[1200px]">
            <h1 className="font-heading text-4xl font-bold leading-[1.1] tracking-tight text-primary md:text-[56px] dark:text-text-primary">
              Software Development.
              <br />
              Closer to Home.
            </h1>
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
                  text: "5-10x kosteneffektiver. Schnellere Delivery, weniger Overhead. Direkter Zugang zu Engineers — kein Junior-heavy Bench-Modell.",
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
                  <p className="mt-1 text-sm font-medium text-accent">{item.subtitle}</p>
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
                  text: "Unser Flaggschiff-Produkt OMNIXIS generiert automatisch Compliance-Doku, technische Doku und Chatbot-Antworten aus eurem Git, Jira und Confluence. Fail-closed: lieber schweigen als lügen.",
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
                  text: "300+ automatisierte Tests, OWASP LLM Top 10, EU AI Act Compliance, Golden Datasets. Wir testen KI-Systeme mit derselben Strenge wie klassische Software — plus AI-spezifische Dimensionen.",
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
                  <p className="mt-1 text-sm font-medium text-accent">{service.subtitle}</p>
                  <p className="mt-3 text-[15px] leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
                    {service.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== OMNIXIS TEASER ===== */}
        <section id="omnixis" className="bg-primary px-4 py-20 md:px-6 md:py-24">
          <div className="mx-auto max-w-[1200px]">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-accent">
                  Unser Flaggschiff
                </p>
                <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-text-primary md:text-4xl">
                  OMNIXIS Documenter+X
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
                <p className="mt-6 text-sm font-mono text-text-secondary/50">
                  <ImageModal
                    src="/images/omnixis-conceived-whiteboard-2025-01-14.png"
                    alt="OMNIXIS Whiteboard-Skizze, Böblingen, Januar 2025"
                  >
                    Conceived
                  </ImageModal>
                  {" "}January 14, 2025 in Böblingen.
                  <br />
                  <ImageModal
                    src="/images/omnixis-born-first-session-2026-03-22.png"
                    alt="Erste OMNIXIS Claude Code Session, März 2026"
                  >
                    Born
                  </ImageModal>
                  {" "}March 22, 2026 in Stuttgart.
                  <br />
                  MVP June, 2026.
                  <br />
                  LIVE September, 2026.
                </p>
              </div>

              {/* Stats grid — 6 tiles */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {[
                  { icon: CalendarDays, value: String(devDays), label: "Days in Development" },
                  { icon: GitCommit, value: stats.commits.toLocaleString("de-DE"), label: "Commits" },
                  { icon: FlaskConical, value: "300+", label: "Automatisierte Tests" },
                  { icon: Layers, value: "46+", label: "REST Endpoints" },
                  { icon: Code2, value: stats.linesOfCode > 0 ? stats.linesOfCode.toLocaleString("de-DE") : "—", label: "Zeilen Code" },
                  { icon: FolderGit2, value: String(stats.repos), label: "Repositories" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl bg-surface p-5 text-center"
                  >
                    <stat.icon size={20} className="mx-auto text-accent" />
                    <p className="mt-2 font-heading text-2xl font-bold text-text-primary md:text-3xl">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== FOUNDER ===== */}
        <section id="founder" className="bg-white px-4 py-20 md:px-6 md:py-24 dark:bg-surface">
          <div className="mx-auto max-w-[1200px]">
            <div className="grid items-start gap-12 md:grid-cols-[280px_1fr]">
              {/* Photo placeholder */}
              <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-2xl bg-neutral-light md:mx-0 md:h-72 md:w-72 dark:bg-deep-space">
                <span className="text-sm text-muted dark:text-text-secondary/50">Foto folgt</span>
              </div>

              <div>
                <h2 className="font-heading text-3xl font-semibold tracking-tight text-primary md:text-4xl dark:text-text-primary">
                  German Rauhut
                </h2>
                <p className="mt-1 text-lg font-medium text-accent">
                  Gründer, neckarshore.ai
                </p>
                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
                  Ehemaliger Mercedes-Benz IT — jetzt Gründer von neckarshore.ai in Stuttgart. Ich
                  baue Software mit KI-Beschleunigung und automatisiere alles, was keiner machen will.
                  Mein Flaggschiff OMNIXIS dokumentiert sich selbst — weil niemand Doku schreiben will,
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
              {/* Photo placeholder */}
              <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-2xl bg-white/40 md:mx-0 md:h-72 md:w-72 dark:bg-white/10">
                <span className="text-sm text-primary/50 dark:text-text-secondary/50">Foto folgt</span>
              </div>

              <div>
                <h2 className="font-heading text-3xl font-semibold tracking-tight text-primary md:text-4xl dark:text-text-primary">
                  MASCHIN &amp; das S-Team
                </h2>
                <p className="mt-1 text-lg font-medium text-primary/70 dark:text-accent">
                  Chief of Staff of Staff &amp; Expertenteam
                </p>
                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-primary/80 dark:text-text-secondary">
                  MASCHIN ist unser KI-gestützter Chief of Staff of Staff — das Betriebssystem hinter
                  neckarshore.ai. Dahinter steht ein S-Team aus spezialisierten KI-Experten: jeder mit
                  einer klaren Rolle, einem Weltklasse-Vorbild und der Fähigkeit, autonom zu arbeiten.
                </p>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-primary/80 dark:text-text-secondary">
                  Von der Architektur über Quality Engineering bis zum Marketing — das S-Team liefert
                  Enterprise-Qualität ohne Enterprise-Headcount. Ein Mensch denkt, entscheidet und
                  verantwortet. Die Maschinen exekutieren.
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
              15 Minuten Kennenlerntermin — wir reden über euer Projekt, nicht über unsere Folien.
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
              <span className="text-muted dark:text-text-secondary/50">oder</span>
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
            // Safe: static FAQ data, no user input
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: faqItems.map((item) => ({
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
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-primary/5 bg-white px-4 py-10 md:px-6 dark:border-text-secondary/10 dark:bg-surface">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-4 text-sm text-muted md:flex-row md:justify-between dark:text-text-secondary/60">
          <Logo size="text-xl" className="opacity-60" />
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
          <p className="text-center text-xs text-muted/60 dark:text-text-secondary/30">Stuttgart, Deutschland</p>
          <div className="text-muted/40 dark:text-text-secondary/20">
            <LiveTicker fetchedAt={stats.fetchedAt} />
          </div>
        </div>
      </footer>

      <CookieBanner />
    </>
  );
}
