import { motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  Download,
  MapPin,
  ArrowUpRight,
  ArrowUp,
  Code2,
  Database,
  Server,
  Wrench,
  Cloud,
  Sparkles,
  GraduationCap,
  Award,
  BadgeCheck,
  ExternalLink,
} from "lucide-react";
import avatarImg from "@/assets/avatar.jpg";
import { useSiteContent, DEFAULT_CONTENT as FALLBACK } from "@/lib/site-content";
import { ThemeToggle } from "@/lib/theme";

/* Small inline brand SVGs (lucide-react in this project lacks Github/Linkedin) */
const GithubIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12 .5a11.5 11.5 0 0 0-3.63 22.41c.58.1.79-.25.79-.56 0-.27-.01-1-.02-1.96-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.75.41-1.27.74-1.56-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.27 5.69.42.36.8 1.07.8 2.16 0 1.56-.02 2.81-.02 3.19 0 .31.21.67.8.55A11.5 11.5 0 0 0 12 .5Z" />
  </svg>
);
const LinkedinIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.71h.05c.53-.95 1.82-1.95 3.75-1.95 4.01 0 4.75 2.5 4.75 5.76V21h-4v-5.4c0-1.29-.03-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85V21h-4V9Z" />
  </svg>
);

const skillIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Languages: Code2,
  Backend: Server,
  Frontend: Sparkles,
  Databases: Database,
  Tools: Wrench,
  Cloud: Cloud,
};

const EASE = [0.22, 1, 0.36, 1] as const;

const NAV_ITEMS = [
  { id: "profile", label: "Profile" },
  { id: "projects", label: "Work" },
  { id: "skills", label: "Skills" },
  { id: "education", label: "Education" },
  { id: "contact", label: "Contact" },
];

/* ---------- Building blocks ---------- */

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[2px] origin-left z-[70] bg-gradient-to-r from-brand to-brand-2"
    />
  );
}

function Nav({ name, avatarUrl, cvUrl }: { name: string; avatarUrl?: string; cvUrl: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    NAV_ITEMS.forEach((n) => {
      const el = document.getElementById(n.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const firstName = name.split(" ").filter(Boolean)[0] || "Portfolio";

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-[min(920px,calc(100%-1.5rem))]"
    >
      <div
        className={`glass rounded-full flex items-center gap-1 pl-2 pr-2 py-2 transition-all duration-500 ${
          scrolled ? "shadow-lg" : ""
        }`}
      >
        <a href="#top" className="flex items-center gap-2.5 pl-1 pr-3">
          <img
            src={avatarUrl || avatarImg}
            alt={`${firstName} profile`}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-brand/40"
            width={32}
            height={32}
          />
          <span className="text-sm font-medium">{firstName}</span>
        </a>
        <div className="hidden md:flex items-center flex-1 justify-center">
          {NAV_ITEMS.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              aria-current={active === n.id ? "true" : undefined}
              className={`relative px-3.5 py-1.5 text-sm transition-colors duration-200 rounded-full ${
                active === n.id
                  ? "text-foreground bg-foreground/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {n.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-1.5 ml-auto md:ml-0">
          <a
            href={cvUrl}
            download
            className="hidden sm:flex h-9 px-4 rounded-full bg-primary text-primary-foreground text-sm font-medium items-center gap-2 hover:opacity-90 active:scale-[0.97] transition"
          >
            <Download className="w-3.5 h-3.5" /> CV
          </a>
          <a
            href={cvUrl}
            download
            aria-label="Download CV"
            className="sm:hidden w-9 h-9 rounded-full glass flex items-center justify-center"
          >
            <Download className="w-4 h-4" />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </motion.nav>
  );
}

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function SectionHeader({
  index,
  label,
  children,
}: {
  index: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal className="mb-12 sm:mb-16">
      <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-5">
        <span className="text-brand">{index}</span>
        <span className="h-px w-10 bg-border" />
        <span>{label}</span>
      </div>
      <h2 className="text-4xl sm:text-6xl font-semibold tracking-tighter leading-[1.02] max-w-3xl">
        {children}
      </h2>
    </Reveal>
  );
}

function SpotCard({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "article";
}) {
  return (
    <Tag
      className={`spotlight card-soft card-hover ${className}`}
      onMouseMove={(e: React.MouseEvent<HTMLElement>) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
    >
      {children}
    </Tag>
  );
}

function AmbientBackground() {
  return (
    <div className="ambient-background" aria-hidden="true">
      <span className="ambient-orb ambient-orb-primary" />
      <span className="ambient-orb ambient-orb-secondary" />
      <span className="ambient-grid" />
    </div>
  );
}

/* Italic serif accent on a heading's last word */
function Accent({ children }: { children: React.ReactNode }) {
  return <span className="font-serif-italic text-gradient pr-1">{children}</span>;
}

/* ---------- Page ---------- */

export default function Portfolio() {
  const { data } = useSiteContent();

  // Same defaults on server and client first paint to avoid hydration mismatch.
  const hero = data?.hero ?? FALLBACK.hero;
  const profile = data?.profile ?? FALLBACK.profile;
  const skills = data?.skills?.items ?? FALLBACK.skills.items;
  const projects = data?.projects?.items ?? FALLBACK.projects.items;
  const education = data?.education?.items ?? FALLBACK.education.items;
  const certs = data?.certifications?.items ?? FALLBACK.certifications.items;
  const contact = data?.contact ?? FALLBACK.contact;
  const cvUrl = contact.cvUrl || FALLBACK.contact.cvUrl;

  const nameWords = hero.name.split(" ").filter(Boolean);
  const allSkills = skills.flatMap((g) => g.skills);

  return (
    <div id="top" className="portfolio-shell relative min-h-screen bg-background text-foreground">
      <AmbientBackground />
      <div className="noise" aria-hidden="true" />
      <ScrollProgress />
      <Nav name={hero.name} avatarUrl={hero.avatarUrl} cvUrl={cvUrl} />

      {/* HERO */}
      <section className="relative pt-36 sm:pt-44 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-[1.35fr_1fr] gap-14 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="inline-flex items-center gap-2.5 rounded-full border border-border bg-foreground/[0.04] px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                {hero.eyebrow}
              </motion.div>

              <h1 className="mt-7 text-[clamp(3rem,9vw,7rem)] font-semibold tracking-tighter leading-[0.92]">
                {nameWords.map((w, i) => {
                  const last = i === nameWords.length - 1 && nameWords.length > 1;
                  return (
                    <span key={i} className="block overflow-hidden pb-[0.08em]">
                      <motion.span
                        className="block"
                        initial={{ y: "105%" }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.9, delay: 0.1 + i * 0.1, ease: EASE }}
                      >
                        {last ? <Accent>{w}</Accent> : w}
                      </motion.span>
                    </span>
                  );
                })}
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
                className="mt-8 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed"
              >
                {hero.tagline}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.65, ease: EASE }}
                className="mt-9 flex flex-wrap items-center gap-3"
              >
                <a
                  href="#projects"
                  className="group h-12 rounded-full px-6 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.97] transition flex items-center gap-2"
                >
                  View my work
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
                <a
                  href={cvUrl}
                  download
                  className="h-12 rounded-full px-6 text-sm font-medium card-soft hover:bg-accent active:scale-[0.97] transition flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download CV
                </a>
                <div className="flex items-center gap-2 sm:ml-2">
                  {[
                    { icon: GithubIcon, href: contact.github, label: "GitHub" },
                    { icon: LinkedinIcon, href: contact.linkedin, label: "LinkedIn" },
                    { icon: Mail, href: `mailto:${contact.email}`, label: "Email" },
                  ].map((c) => (
                    <a
                      key={c.label}
                      href={c.href}
                      target={c.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      aria-label={c.label}
                      className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent hover:-translate-y-0.5 transition duration-200"
                    >
                      <c.icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Portrait */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: EASE }}
              className="relative mx-auto w-full max-w-sm lg:max-w-none"
            >
              <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-brand/30 via-transparent to-brand-2/25 blur-3xl" />
              <div className="gradient-border relative aspect-[4/5] rounded-[2rem] overflow-hidden card-soft">
                <div className="absolute inset-0 bg-gradient-to-br from-brand/20 via-surface to-brand-2/15" />
                <div className="absolute inset-0 flex items-center justify-center pb-16">
                  <img
                    src={hero.avatarUrl || avatarImg}
                    alt={hero.name}
                    className="float-slow aspect-square w-[68%] rounded-full object-cover ring-1 ring-foreground/15 shadow-2xl shadow-brand/30"
                  />
                </div>
                <div className="absolute left-4 bottom-4 right-4 glass rounded-2xl px-4 py-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{hero.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3 h-3" /> {hero.location}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">
                    Open to work
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          {(hero.stats ?? []).length > 0 && (
            <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(hero.stats ?? []).map((s, i) => (
                <Reveal key={s.label + i} delay={i * 0.08}>
                  <SpotCard className="rounded-2xl p-6 h-full">
                    <p className="text-3xl sm:text-4xl font-semibold tracking-tighter">{s.value}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
                  </SpotCard>
                </Reveal>
              ))}
            </div>
          )}
        </div>

        {/* Skills marquee */}
        {allSkills.length > 0 && (
          <div className="marquee-wrap mt-20" aria-hidden="true">
            <div className="marquee">
              {[...allSkills, ...allSkills].map((s, i) => (
                <span
                  key={i}
                  className="shrink-0 rounded-full border border-border bg-foreground/[0.03] px-5 py-2 font-mono text-xs uppercase tracking-widest text-muted-foreground"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* PROFILE */}
      <section id="profile" className="px-6 py-24 sm:py-32 max-w-6xl mx-auto">
        <SectionHeader index="01" label={profile.eyebrow}>
          {profile.title}
        </SectionHeader>
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-14 items-start">
          <Reveal>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              {profile.body}
            </p>
            <div className="mt-8 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5">
                <MapPin className="w-3 h-3" />
                {hero.location}
              </span>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="card-soft gradient-border rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <span className="traffic-dots">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                </span>
                <span className="text-xs text-muted-foreground font-mono ml-2">
                  ~/profile.status
                </span>
              </div>
              <div className="p-6 space-y-5 font-mono text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-brand">role_focus</p>
                  <p className="text-foreground mt-1.5">{profile.roleFocus}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-brand">core_stack</p>
                  <p className="text-foreground mt-1.5">{profile.coreStack}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-4 border-t border-border">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Available for internship opportunities
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects" className="px-6 py-24 sm:py-32 max-w-6xl mx-auto">
        <SectionHeader index="02" label="Selected work">
          Things I&apos;ve <Accent>built.</Accent>
        </SectionHeader>
        <div className="grid md:grid-cols-2 gap-5">
          {projects.map((p, i) => (
            <Reveal
              key={p.name + i}
              delay={(i % 2) * 0.08}
              className={i === 0 && projects.length > 2 ? "md:col-span-2" : ""}
            >
              <SpotCard as="article" className="rounded-3xl p-7 sm:p-9 h-full group">
                <div className="flex items-start justify-between gap-4">
                  <span className="font-mono text-5xl sm:text-6xl font-semibold tracking-tighter text-foreground/10 group-hover:text-brand/50 transition-colors duration-500">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:rotate-45 transition-all duration-500">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {p.tag}
                  </p>
                  {p.inProgress && (
                    <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      In progress
                    </span>
                  )}
                </div>
                <h3 className="text-2xl sm:text-3xl font-semibold mt-2 mb-3">{p.name}</h3>
                <p className="text-muted-foreground leading-relaxed mb-7 max-w-2xl">
                  {p.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {p.tech.map((t) => (
                    <span
                      key={t}
                      className="font-mono text-[11px] px-2.5 py-1 rounded-md bg-foreground/[0.05] text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </SpotCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SKILLS */}
      <section id="skills" className="px-6 py-24 sm:py-32 max-w-6xl mx-auto">
        <SectionHeader index="03" label="Toolkit">
          Skills &amp; <Accent>stack.</Accent>
        </SectionHeader>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {skills.map((g, i) => {
            const Icon = skillIconMap[g.label] || Sparkles;
            return (
              <Reveal key={g.label + i} delay={(i % 3) * 0.06}>
                <SpotCard className="rounded-2xl p-6 h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand/25 to-brand-2/15 text-brand flex items-center justify-center">
                      <Icon className="w-[18px] h-[18px]" />
                    </div>
                    <h3 className="font-medium text-lg">{g.label}</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {g.skills.map((s) => (
                      <span
                        key={s}
                        className="text-xs px-3 py-1.5 rounded-full border border-border bg-foreground/[0.03] text-muted-foreground hover:text-foreground hover:border-brand/50 transition-colors"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </SpotCard>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* EDUCATION + CERTS */}
      <section id="education" className="px-6 py-24 sm:py-32 max-w-6xl mx-auto">
        <SectionHeader index="04" label="Background">
          Education &amp; <Accent>certifications.</Accent>
        </SectionHeader>
        <div className="grid lg:grid-cols-5 gap-10 lg:gap-14">
          <div className="lg:col-span-3 relative pl-9">
            <span className="timeline-line absolute left-[11px] top-2 bottom-2 w-px" />
            <div className="space-y-6">
              {education.map((e, i) => (
                <Reveal key={e.title + i} delay={i * 0.05}>
                  <div className="relative">
                    <span className="absolute -left-9 top-6 flex h-6 w-6 items-center justify-center rounded-full bg-background border border-brand/60">
                      <span className="h-2 w-2 rounded-full bg-brand" />
                    </span>
                    <SpotCard className="rounded-2xl p-6">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="font-medium text-lg flex items-center gap-2.5">
                          <GraduationCap className="w-4 h-4 text-brand shrink-0" />
                          {e.title}
                        </h3>
                        <span className="font-mono text-xs text-muted-foreground">{e.period}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1.5">{e.org}</p>
                      {e.notes && (
                        <p className="text-sm text-muted-foreground/80 mt-3 leading-relaxed">
                          {e.notes}
                        </p>
                      )}
                    </SpotCard>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2">
            <Reveal delay={0.1} className="lg:sticky lg:top-28">
              <div className="card-soft gradient-border rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Award className="w-5 h-5 text-brand" />
                  <h3 className="font-medium text-lg">Certifications</h3>
                </div>
                <ul className="space-y-5">
                  {certs.map((c, i) => (
                    <li key={c.title + i} className="flex gap-3 text-sm">
                      <BadgeCheck className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium leading-snug">{c.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {c.issuer}
                          {c.year ? ` · ${c.year}` : ""}
                        </p>
                        {c.url && (
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-brand hover:underline mt-1.5"
                          >
                            View credential <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="px-6 py-24 sm:py-32 max-w-6xl mx-auto">
        <Reveal>
          <div className="relative gradient-border card-soft rounded-[2rem] overflow-hidden p-8 sm:p-16">
            <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-brand/25 blur-3xl" />
            <div className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-brand-2/20 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">
                <span className="text-brand">05</span>
                <span className="h-px w-10 bg-border" />
                <span>Contact</span>
              </div>
              <h2 className="text-5xl sm:text-7xl font-semibold tracking-tighter leading-[0.98]">
                Let&apos;s build
                <br />
                something <Accent>great.</Accent>
              </h2>
              <p className="mt-6 text-muted-foreground max-w-xl text-lg">
                Open to internship roles and conversations with HR &amp; engineering teams.
              </p>
              <a
                href={`mailto:${contact.email}`}
                className="group mt-10 inline-flex max-w-full items-center gap-3 rounded-full bg-primary text-primary-foreground pl-6 pr-3 py-3 text-sm sm:text-base font-medium hover:opacity-90 active:scale-[0.98] transition"
              >
                <span className="truncate">{contact.email}</span>
                <span className="w-9 h-9 shrink-0 rounded-full bg-background text-foreground flex items-center justify-center group-hover:rotate-45 transition-transform duration-500">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </a>

              <div className="grid sm:grid-cols-3 gap-3 mt-12">
                {[
                  {
                    Icon: Phone,
                    label: "Phone",
                    value: contact.phone,
                    href: `tel:${contact.phone.replace(/\s/g, "")}`,
                  },
                  {
                    Icon: LinkedinIcon,
                    label: "LinkedIn",
                    value: contact.linkedin.replace(/^https?:\/\/(www\.)?/, ""),
                    href: contact.linkedin,
                  },
                  {
                    Icon: GithubIcon,
                    label: "GitHub",
                    value: contact.github.replace(/^https?:\/\/(www\.)?/, ""),
                    href: contact.github,
                  },
                ].map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    target={l.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="rounded-2xl p-4 flex items-center gap-4 border border-border bg-background/40 backdrop-blur hover:bg-background/70 hover:border-brand/40 transition group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-foreground/[0.06] flex items-center justify-center">
                      <l.Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">{l.label}</p>
                      <p className="text-sm truncate">{l.value}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="px-6 pb-10 max-w-6xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-mono">
          © {new Date().getFullYear()} {hero.name}
        </span>
        <a
          href="#top"
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 hover:text-foreground hover:bg-accent transition"
        >
          Back to top <ArrowUp className="w-3 h-3" />
        </a>
      </footer>
    </div>
  );
}
