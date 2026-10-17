import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, Check, Copy, Download, Mail, MapPin, Phone } from "lucide-react";
import avatarImg from "@/assets/avatar.jpg";
import { useSiteContent, DEFAULT_CONTENT as FALLBACK } from "@/lib/site-content";
import { ThemeToggle } from "@/lib/theme";

const EASE = [0.22, 1, 0.36, 1] as const;

const NAV_ITEMS = [
  { id: "profile", label: "About" },
  { id: "projects", label: "Work" },
  { id: "skills", label: "Skills" },
  { id: "education", label: "Education" },
  { id: "contact", label: "Contact" },
];

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

/* ---------- Motion helpers ---------- */

/* Types lines one after another; returns the text revealed so far per line. */
function useTypedLines(lines: string[], start: boolean, speed = 28) {
  const reduce = useReducedMotion();
  const [typed, setTyped] = useState<string[]>(() => (reduce ? lines : []));
  const key = lines.join("\n");

  useEffect(() => {
    if (reduce) {
      setTyped(lines);
      return;
    }
    if (!start) return;
    let line = 0;
    let char = 0;
    setTyped([""]);
    const id = setInterval(() => {
      char += 1;
      const l = line;
      const text = lines[l].slice(0, char);
      setTyped((prev) => {
        const next = [...prev];
        next[l] = text;
        return next;
      });
      if (char >= lines[l].length) {
        line += 1;
        char = 0;
        if (line >= lines.length) {
          clearInterval(id);
          return;
        }
        setTyped((prev) => (prev.length > line ? prev : [...prev, ""]));
      }
    }, speed);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, start, reduce]);

  return typed;
}

function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const match = value.match(/^(\d+)(.*)$/);
  const target = match ? parseInt(match[1], 10) : null;
  const suffix = match ? match[2] : "";
  const [n, setN] = useState(reduce || target === null ? (target ?? 0) : 0);

  useEffect(() => {
    if (!inView || target === null || reduce) return;
    const controls = animate(0, target, {
      duration: 1.4,
      ease: EASE,
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, target, reduce]);

  return <span ref={ref}>{target === null ? value : `${n}${suffix}`}</span>;
}

function Reveal({
  children,
  className,
  delay = 0,
  y = 20,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* Card that tilts toward the cursor and carries a soft spotlight */
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 220, damping: 22 });
  const sry = useSpring(ry, { stiffness: 220, damping: 22 });

  return (
    <motion.div
      style={reduce ? undefined : { rotateX: srx, rotateY: sry, transformPerspective: 900 }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
        if (!reduce) {
          ry.set((px - 0.5) * 6);
          rx.set(-(py - 0.5) * 6);
        }
      }}
      onMouseLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
      className={`spotlight ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Layout pieces ---------- */

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed top-0 inset-x-0 h-[2px] origin-left z-[60] bg-gradient-to-r from-brand to-brand-2"
    />
  );
}

function Header({ name, avatarUrl, cvUrl }: { name: string; avatarUrl?: string; cvUrl: string }) {
  const [active, setActive] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    NAV_ITEMS.forEach((n) => {
      const el = document.getElementById(n.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const firstName = name.split(" ").filter(Boolean)[0] || "Portfolio";

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: EASE }}
      className="fixed top-4 inset-x-0 z-50 px-4"
    >
      <div className="glass max-w-3xl mx-auto rounded-full pl-3 pr-2 h-14 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5">
          <img
            src={avatarUrl || avatarImg}
            alt=""
            className="w-8 h-8 rounded-full object-cover"
            width={32}
            height={32}
          />
          <span className="text-sm font-semibold tracking-tight hidden sm:inline">{firstName}</span>
        </a>
        <nav className="hidden md:flex items-center" aria-label="Primary">
          {NAV_ITEMS.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              aria-current={active === n.id ? "true" : undefined}
              className={`relative px-3.5 py-1.5 text-sm rounded-full transition-colors ${
                active === n.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {active === n.id && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-foreground/[0.08]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative">{n.label}</span>
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <a
            href={cvUrl}
            download
            className="h-10 px-4 rounded-full bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Resume</span>
          </a>
          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  );
}

function Aurora() {
  return (
    <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[44rem] overflow-hidden -z-10">
      <div className="aurora aurora-a" />
      <div className="aurora aurora-b" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
    </div>
  );
}

function Terminal({ lines }: { lines: { cmd: string; out: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const flat = lines.flatMap((l) => [`$ ${l.cmd}`, l.out]);
  const typed = useTypedLines(flat, inView, 22);
  const done = typed.length === flat.length && typed[typed.length - 1] === flat[flat.length - 1];

  return (
    <div ref={ref} className="card-soft gradient-border rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <span className="traffic-dots">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        </span>
        <span className="ml-2 text-xs text-muted-foreground font-mono">~/portfolio</span>
      </div>
      <div className="p-5 sm:p-6 font-mono text-[13px] leading-relaxed min-h-[15rem]">
        {flat.map((_, i) => {
          const text = typed[i];
          if (text === undefined) return null;
          const isCmd = i % 2 === 0;
          const isLast = i === typed.length - 1;
          return (
            <p
              key={i}
              className={`${isCmd ? "text-foreground mt-3 first:mt-0" : "text-muted-foreground"} break-words`}
            >
              {isCmd ? <span className="text-brand">{text.slice(0, 1)}</span> : null}
              {isCmd ? text.slice(1) : text}
              {isLast && !done && <span className="caret" />}
            </p>
          );
        })}
        {done && (
          <p className="mt-3 text-foreground">
            <span className="text-brand">$</span> <span className="caret" />
          </p>
        )}
      </div>
    </div>
  );
}

function Section({
  id,
  index,
  eyebrow,
  title,
  children,
}: {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="py-20 sm:py-28">
      <div className="max-w-5xl mx-auto px-6">
        <Reveal className="mb-12 sm:mb-14">
          <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span className="text-brand">{index}</span>
            <span className="h-px w-10 bg-border" />
            {eyebrow}
          </p>
          <h2 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight">{title}</h2>
        </Reveal>
        {children}
      </div>
    </section>
  );
}

const card = "card-soft rounded-2xl";

function TimelineEducation({
  items,
}: {
  items: { title: string; org: string; period: string; notes: string }[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });

  return (
    <div ref={ref} className="relative pl-9">
      <span className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
      <motion.span
        style={{ scaleY }}
        className="absolute left-[11px] top-2 bottom-2 w-px origin-top bg-gradient-to-b from-brand to-brand-2"
      />
      <div className="space-y-5">
        {items.map((e, i) => (
          <Reveal key={e.title + i} delay={i * 0.04}>
            <div className="relative">
              <motion.span
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
                className="absolute -left-9 top-6 flex h-6 w-6 items-center justify-center rounded-full bg-background border border-brand/60"
              >
                <span className="h-2 w-2 rounded-full bg-brand" />
              </motion.span>
              <div className={`${card} p-6 card-hover`}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-semibold tracking-tight">{e.title}</h3>
                  <span className="font-mono text-xs text-muted-foreground">{e.period}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{e.org}</p>
                {e.notes && (
                  <p className="mt-3 text-sm text-muted-foreground/90 leading-relaxed">{e.notes}</p>
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(email);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          /* clipboard unavailable; the mailto link still works */
        }
      }}
      className="h-12 px-5 rounded-full border border-input text-sm font-medium flex items-center gap-2 hover:bg-accent transition-colors"
    >
      <motion.span
        key={copied ? "ok" : "copy"}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
        className="flex"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
      </motion.span>
      {copied ? "Copied" : "Copy email"}
    </button>
  );
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
  const stats = hero.stats ?? [];
  const allSkills = skills.flatMap((g) => g.skills);
  const half = Math.ceil(allSkills.length / 2);
  const rowA = allSkills.slice(0, half);
  const rowB = allSkills.slice(half);

  const nameWords = hero.name.split(" ").filter(Boolean);

  const links = [
    { Icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}` },
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
  ];

  const terminalLines = [
    { cmd: "whoami", out: `${hero.name} — ${hero.eyebrow}` },
    { cmd: "focus", out: profile.roleFocus },
    { cmd: "stack", out: profile.coreStack },
    { cmd: "status", out: `Available for internships · ${hero.location}` },
  ];

  return (
    <div id="top" className="relative min-h-screen bg-background text-foreground">
      <ScrollProgress />
      <Header name={hero.name} avatarUrl={hero.avatarUrl} cvUrl={cvUrl} />

      {/* HERO */}
      <section className="relative pt-40 sm:pt-48 pb-16 sm:pb-24">
        <Aurora />
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid lg:grid-cols-[1.25fr_1fr] gap-12 lg:gap-14 items-center">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="inline-flex items-center gap-2.5 rounded-full border border-border bg-card/70 backdrop-blur px-3.5 py-1.5 text-sm text-muted-foreground"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500/70 live-dot" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                {hero.eyebrow}
              </motion.p>

              <h1 className="mt-7 text-5xl sm:text-7xl font-semibold tracking-[-0.04em] leading-[1.02]">
                {nameWords.map((w, i) => (
                  <motion.span
                    key={i}
                    className={`block ${i > 0 ? "text-gradient" : ""}`}
                    initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.9, delay: 0.1 + i * 0.12, ease: EASE }}
                  >
                    {w}
                  </motion.span>
                ))}
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.45, ease: EASE }}
                className="mt-7 text-lg text-muted-foreground leading-relaxed max-w-xl"
              >
                {hero.tagline}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6, ease: EASE }}
                className="mt-9 flex flex-wrap items-center gap-3"
              >
                <a
                  href="#projects"
                  className="group h-12 rounded-full px-6 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  View my work
                  <ArrowDown className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                </a>
                <a
                  href="#contact"
                  className="h-12 rounded-full px-6 text-sm font-medium border border-input bg-card/60 backdrop-blur hover:bg-accent transition-colors flex items-center"
                >
                  Get in touch
                </a>
                <span className="hidden sm:inline-flex items-center gap-1.5 ml-1 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  {hero.location}
                </span>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.35, ease: EASE }}
            >
              <Terminal lines={terminalLines} />
            </motion.div>
          </div>

          {stats.length > 0 && (
            <dl className="mt-16 sm:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {stats.map((s, i) => (
                <Reveal key={s.label + i} delay={i * 0.08}>
                  <div className={`${card} p-6 h-full`}>
                    <dd className="text-3xl font-semibold tracking-tight">
                      <CountUp value={s.value} />
                    </dd>
                    <dt className="mt-1.5 text-sm text-muted-foreground">{s.label}</dt>
                  </div>
                </Reveal>
              ))}
            </dl>
          )}
        </div>
      </section>

      {/* SKILL MARQUEE */}
      {allSkills.length > 0 && (
        <div aria-hidden="true" className="space-y-3 py-6 border-y border-border bg-card/40">
          {[rowA, rowB].map((row, r) =>
            row.length === 0 ? null : (
              <div key={r} className="marquee-wrap">
                <div className={`marquee ${r === 1 ? "marquee-reverse" : ""}`}>
                  {[...row, ...row, ...row, ...row].map((s, i) => (
                    <span
                      key={i}
                      className="shrink-0 rounded-full border border-border bg-background px-4 py-1.5 text-sm text-muted-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ),
          )}
        </div>
      )}

      {/* ABOUT */}
      <Section id="profile" index="01" eyebrow={profile.eyebrow || "About"} title={profile.title}>
        <Reveal>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl">
            {profile.body}
          </p>
        </Reveal>
      </Section>

      {/* WORK */}
      <Section id="projects" index="02" eyebrow="Selected work" title="Projects">
        <div className="grid md:grid-cols-2 gap-5" style={{ perspective: "1200px" }}>
          {projects.map((p, i) => (
            <Reveal
              key={p.name + i}
              delay={(i % 2) * 0.08}
              className={`h-full ${i === 0 && projects.length > 2 ? "md:col-span-2" : ""}`}
            >
              <TiltCard className={`${card} p-7 sm:p-8 h-full group flex flex-col`}>
                <div className="flex items-start justify-between gap-4">
                  <span className="font-mono text-sm text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-transparent transition-colors duration-300">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <p className="text-sm text-brand">{p.tag}</p>
                  {p.inProgress && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                      In progress
                    </span>
                  )}
                </div>
                <h3 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">{p.name}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed flex-1 max-w-2xl">
                  {p.description}
                </p>
                <div className="mt-6 flex flex-wrap gap-1.5">
                  {p.tech.map((t) => (
                    <span
                      key={t}
                      className="font-mono text-[11px] px-2.5 py-1 rounded-md bg-muted text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* SKILLS */}
      <Section id="skills" index="03" eyebrow="Toolkit" title="Skills & stack">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {skills.map((g, i) => (
            <Reveal key={g.label + i} delay={(i % 3) * 0.07} className="h-full">
              <TiltCard className={`${card} p-6 h-full`}>
                <h3 className="font-semibold">{g.label}</h3>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {g.skills.map((s, j) => (
                    <motion.li
                      key={s}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.2 + j * 0.04, ease: EASE }}
                      className="text-xs px-2.5 py-1 rounded-md bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {s}
                    </motion.li>
                  ))}
                </ul>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* EDUCATION */}
      <Section id="education" index="04" eyebrow="Background" title="Education & certifications">
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-10 lg:gap-14 items-start">
          <TimelineEducation items={education} />
          <Reveal className="lg:sticky lg:top-28">
            <div className={`${card} gradient-border p-6`}>
              <h3 className="font-semibold">Certifications</h3>
              <ul className="mt-4 divide-y divide-border">
                {certs.map((c, i) => (
                  <li key={c.title + i} className="py-3 first:pt-0 last:pb-0">
                    <p className="text-sm font-medium leading-snug">{c.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {c.issuer}
                      {c.year ? ` · ${c.year}` : ""}
                    </p>
                    {c.url && (
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs text-brand hover:underline"
                      >
                        View credential <ArrowUpRight className="w-3 h-3" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* CONTACT */}
      <Section id="contact" index="05" eyebrow="Contact" title="Let's work together">
        <Reveal>
          <div className={`${card} gradient-border relative overflow-hidden p-6 sm:p-10`}>
            <div aria-hidden="true" className="aurora aurora-c" />
            <div className="relative">
              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                Open to internship roles and conversations with HR &amp; engineering teams. Email is
                the quickest way to reach me.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={`mailto:${contact.email}`}
                  className="h-12 px-6 rounded-full bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <Mail className="w-4 h-4" /> Say hello
                </a>
                <CopyEmail email={contact.email} />
              </div>
              <div className="mt-10 grid sm:grid-cols-2 gap-3">
                {links.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    target={l.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 rounded-xl border border-border bg-background/60 backdrop-blur p-4 hover:bg-accent hover:border-foreground/20 transition-colors"
                  >
                    <span className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <l.Icon className="w-4 h-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs text-muted-foreground">{l.label}</span>
                      <span className="block text-sm truncate">{l.value}</span>
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </Section>

      <footer className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            © {new Date().getFullYear()} {hero.name}
          </span>
          <a href="#top" className="hover:text-foreground transition-colors">
            Back to top
          </a>
        </div>
      </footer>
    </div>
  );
}
