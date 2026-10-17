import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowUpRight, Download, Mail, MapPin, Phone } from "lucide-react";
import avatarImg from "@/assets/avatar.jpg";
import { useSiteContent, DEFAULT_CONTENT as FALLBACK } from "@/lib/site-content";
import { ThemeToggle } from "@/lib/theme";

const EASE = [0.25, 0.1, 0.25, 1] as const;

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

/* ---------- Building blocks ---------- */

function Header({ name, avatarUrl, cvUrl }: { name: string; avatarUrl?: string; cvUrl: string }) {
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

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
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        scrolled ? "bg-background/85 backdrop-blur-xl border-border" : "border-transparent"
      }`}
    >
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5">
          <img
            src={avatarUrl || avatarImg}
            alt=""
            className="w-7 h-7 rounded-full object-cover"
            width={28}
            height={28}
          />
          <span className="text-sm font-semibold tracking-tight">{firstName}</span>
        </a>
        <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
          {NAV_ITEMS.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              aria-current={active === n.id ? "true" : undefined}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                active === n.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href={cvUrl}
            download
            className="h-9 px-3.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Résumé</span>
          </a>
          <ThemeToggle className="!rounded-lg" />
        </div>
      </div>
    </header>
  );
}

/* Gentle fade on scroll, no movement */
function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="py-20 sm:py-24">
      <div className="max-w-5xl mx-auto px-6">
        <Reveal className="mb-10 sm:mb-12">
          <p className="text-sm font-medium text-brand">{eyebrow}</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h2>
        </Reveal>
        {children}
      </div>
    </section>
  );
}

const card =
  "rounded-2xl border border-border bg-card transition-colors duration-200 hover:border-foreground/25";

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

  return (
    <div id="top" className="min-h-screen bg-background text-foreground">
      <Header name={hero.name} avatarUrl={hero.avatarUrl} cvUrl={cvUrl} />

      {/* HERO */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="pt-36 sm:pt-44 pb-16 sm:pb-24"
      >
        <div className="max-w-5xl mx-auto px-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {hero.eyebrow}
          </p>
          <h1 className="mt-7 text-5xl sm:text-7xl md:text-8xl font-semibold tracking-[-0.04em] leading-[1.02]">
            {hero.name}
          </h1>
          <p className="mt-7 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            {hero.tagline}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#projects"
              className="h-11 rounded-lg px-5 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center"
            >
              View work
            </a>
            <a
              href="#contact"
              className="h-11 rounded-lg px-5 text-sm font-medium border border-input hover:bg-accent transition-colors flex items-center"
            >
              Get in touch
            </a>
            <span className="ml-1 hidden sm:inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              {hero.location}
            </span>
          </div>

          {stats.length > 0 && (
            <dl className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {stats.map((s, i) => (
                <div key={s.label + i} className={`${card} p-5`}>
                  <dd className="text-2xl font-semibold tracking-tight">{s.value}</dd>
                  <dt className="mt-1 text-sm text-muted-foreground">{s.label}</dt>
                </div>
              ))}
            </dl>
          )}
        </div>
      </motion.section>

      {/* ABOUT */}
      <Section id="profile" eyebrow={profile.eyebrow || "About"} title={profile.title}>
        <Reveal>
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-10 lg:gap-14">
            <p className="text-lg text-muted-foreground leading-relaxed">{profile.body}</p>
            <dl className="space-y-5">
              {[
                { k: "Role focus", v: profile.roleFocus },
                { k: "Core stack", v: profile.coreStack },
                { k: "Location", v: hero.location },
              ].map((r) => (
                <div key={r.k} className="border-l-2 border-border pl-4">
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {r.k}
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed">{r.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </Section>

      {/* WORK */}
      <Section id="projects" eyebrow="Selected work" title="Projects">
        <div className="grid md:grid-cols-2 gap-5">
          {projects.map((p, i) => (
            <Reveal key={p.name + i} className="h-full">
              <article className={`${card} p-7 h-full flex flex-col`}>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-brand">{p.tag}</p>
                  {p.inProgress && (
                    <span className="shrink-0 text-xs px-2.5 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                      In progress
                    </span>
                  )}
                </div>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight">{p.name}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed flex-1">{p.description}</p>
                <div className="mt-6 flex flex-wrap gap-1.5">
                  {p.tech.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2.5 py-1 rounded-md bg-muted text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* SKILLS */}
      <Section id="skills" eyebrow="Toolkit" title="Skills">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {skills.map((g, i) => (
            <Reveal key={g.label + i} className="h-full">
              <div className={`${card} p-6 h-full`}>
                <h3 className="font-semibold">{g.label}</h3>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {g.skills.map((s) => (
                    <li
                      key={s}
                      className="text-xs px-2.5 py-1 rounded-md bg-muted text-muted-foreground"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* EDUCATION */}
      <Section id="education" eyebrow="Background" title="Education & certifications">
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-12 items-start">
          <div className="space-y-4">
            {education.map((e, i) => (
              <Reveal key={e.title + i}>
                <div className={`${card} p-6`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="font-semibold tracking-tight">{e.title}</h3>
                    <span className="text-xs text-muted-foreground">{e.period}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{e.org}</p>
                  {e.notes && (
                    <p className="mt-3 text-sm text-muted-foreground/90 leading-relaxed">
                      {e.notes}
                    </p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className={`${card} p-6`}>
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
      <Section id="contact" eyebrow="Contact" title="Let's work together">
        <Reveal>
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-10">
            <p className="text-muted-foreground max-w-xl leading-relaxed">
              Open to internship roles and conversations with HR &amp; engineering teams. The
              quickest way to reach me is email.
            </p>
            <div className="mt-8 grid sm:grid-cols-2 gap-3">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 rounded-xl border border-border p-4 hover:bg-accent hover:border-foreground/20 transition-colors"
                >
                  <span className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <l.Icon className="w-4 h-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs text-muted-foreground">{l.label}</span>
                    <span className="block text-sm truncate">{l.value}</span>
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </a>
              ))}
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
