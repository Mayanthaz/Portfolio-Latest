import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  Download,
  MapPin,
  ArrowUpRight,
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
import { useSiteContent, type SiteContentMap } from "@/lib/site-content";

const FALLBACK: SiteContentMap = {
  hero: {
    name: "Mayantha Udayanga",
    eyebrow: "Software Engineering Undergraduate",
    tagline:
      "I build clean full-stack, mobile, desktop, and database-driven applications with a focus on practical workflows, reliable APIs, and polished user interfaces.",
    location: "Sri Lanka",
    stats: [
      { value: "4", label: "Product builds" },
      { value: "Full stack", label: "Spring Boot, Node.js, .NET" },
      { value: "Intern-ready", label: "Available immediately" },
    ],
  },
  profile: {
    eyebrow: "Profile",
    title: "Intern-ready engineer with a product mindset.",
    body: "Second-year Software Engineering undergraduate at the National Institute of Business Management. Experienced in academic full-stack, mobile, desktop, database-driven and API-based application development. I care about clean code, OOP, MVC structure, REST integration, and shipping reliable features within team workflows.",
    roleFocus: "Full Stack Software Engineering Intern",
    coreStack: "Java · Spring Boot · Node.js · .NET · SQL · React",
  },
  skills: {
    items: [
      { label: "Languages", skills: ["Java", "JavaScript", "SQL", "C#", "C", "C++"] },
      { label: "Backend", skills: ["Spring Boot", "Node.js", ".NET", "REST APIs", "MVC", "CRUD"] },
      { label: "Frontend", skills: ["HTML", "CSS", "JavaScript", "Responsive UI"] },
      { label: "Databases", skills: ["SQL", "Schema Design", "Queries", "Integration"] },
      { label: "Tools", skills: ["Git", "GitHub", "VS Code", "Android Studio", "Docker"] },
      { label: "Cloud", skills: ["AWS Solutions Architect (in progress)"] },
    ],
  },
  projects: {
    items: [
      {
        name: "LUXE",
        tag: "Full-Stack Hotel Management",
        description: "Java + Spring Boot hotel management system with REST APIs and SQL.",
        tech: ["Java", "Spring Boot", "REST", "SQL", "MVC"],
        inProgress: false,
      },
      {
        name: "InstaTute",
        tag: "Learning Management Platform",
        description: "Web-based LMS connecting institutions, tutors, and students.",
        tech: ["Full-Stack", "Web App", "DB Design"],
        inProgress: false,
      },
      {
        name: "EZKEY",
        tag: "Digital Product Mobile App",
        description:
          "Mobile app for digital product sales with listing and secure purchasing flow.",
        tech: ["Android", "Mobile", "CRUD"],
        inProgress: true,
      },
      {
        name: "Library Management",
        tag: "Windows Desktop Application",
        description: "Desktop application to manage books, records and administrative tasks.",
        tech: ["C#", ".NET", "Desktop", "SQL"],
        inProgress: false,
      },
    ],
  },
  education: {
    items: [
      {
        title: "BSc (Hons) Software Engineering",
        org: "National Institute of Business Management",
        period: "Undergraduate",
        notes: "Pursuing honours degree alongside applied projects.",
      },
      {
        title: "Higher National Diploma in Software Engineering",
        org: "NIBM",
        period: "2026 – Present",
        notes: "Enterprise App Development 2, Mobile, DSA, IoT & Robotics.",
      },
      {
        title: "Diploma in Software Engineering",
        org: "NIBM · GPA 3.3 / 4.0",
        period: "2024 – 2025",
        notes: "Full-Stack Web, Database Management, Enterprise App Dev 1.",
      },
      {
        title: "G.C.E. A/L — Mathematics Stream",
        org: "General English: B · ICT: B",
        period: "2023",
        notes: "",
      },
    ],
  },
  certifications: {
    items: [
      { title: "Introduction to Cybersecurity", issuer: "Cisco", year: "2024", url: "" },
      {
        title: "Share Data Using Google Data Analytics",
        issuer: "Google Cloud",
        year: "2024",
        url: "",
      },
      {
        title: "AWS Solutions Architect — Associate",
        issuer: "Amazon Web Services",
        year: "In progress",
        url: "",
      },
    ],
  },
  contact: {
    email: "mayantha743@gmail.com",
    phone: "+94 78 368 6802",
    linkedin: "https://linkedin.com/in/mayanthaudayanga",
    github: "https://github.com/Mayanthaz",
    cvUrl: "/Mayantha_Udayanga_CV.pdf",
  },
};
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

function Nav({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on);
    return () => window.removeEventListener("scroll", on);
  }, []);
  const firstName = name.split(" ")[0] || "Portfolio";
  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-[min(960px,calc(100%-2rem))]"
    >
      <div
        className={`glass rounded-full flex items-center gap-1 pl-2 pr-2 py-2 transition-all duration-300 ${
          scrolled ? "scale-[0.98]" : ""
        }`}
      >
        <div className="flex items-center gap-2 pl-1 pr-3">
          <img
            src={avatarUrl || avatarImg}
            alt={`${firstName} profile`}
            className="w-7 h-7 rounded-full object-cover"
            width={28}
            height={28}
          />
          <span className="text-sm font-medium">{firstName}</span>
        </div>
        <div className="hidden md:flex items-center flex-1 justify-center">
          {[
            { id: "profile", label: "Profile" },
            { id: "projects", label: "Work" },
            { id: "skills", label: "Skills" },
            { id: "education", label: "Education" },
            { id: "contact", label: "Contact" },
          ].map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className="px-3.5 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-accent"
            >
              {n.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-1.5 ml-auto md:ml-0">
          <a
            href="/Mayantha_Udayanga_CV.pdf"
            download
            aria-label="Download CV"
            className="w-9 h-9 rounded-full glass flex items-center justify-center hover:scale-[1.05] transition"
          >
            <Download className="w-4 h-4" />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </motion.nav>
  );
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-3">{children}</p>
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

  return (
    <div className="portfolio-shell relative min-h-screen bg-background text-foreground">
      <AmbientBackground />
      <Nav name={hero.name} avatarUrl={hero.avatarUrl} />

      {/* HERO */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/45 to-background" />
        </div>

        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-[1.2fr_1fr] gap-12 items-end">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-5"
            >
              {hero.eyebrow}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="text-5xl sm:text-7xl md:text-[5.5rem] font-semibold tracking-tighter leading-[0.95]"
            >
              {hero.name.split(" ").map((w, i) => (
                <span key={i} className="block">
                  {w}
                </span>
              ))}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-6 text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed"
            >
              {hero.tagline}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <a
                href="#projects"
                className="rounded-full px-5 py-2.5 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition flex items-center gap-2"
              >
                <ArrowUpRight className="w-4 h-4" />
                View Work
              </a>
              <a
                href="/Mayantha_Udayanga_CV.pdf"
                download
                className="rounded-full px-5 py-2.5 text-sm font-medium card-soft hover:bg-accent transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download CV
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3"
          >
            {hero.stats?.map((s) => (
              <div key={s.label} className="card-soft rounded-2xl p-5">
                <p className="text-lg font-semibold tracking-tight">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {contact && (
          <div className="mt-16 flex justify-center gap-2">
            {[
              { icon: Mail, href: `mailto:${contact.email}`, label: "Email" },
              { icon: Phone, href: `tel:${contact.phone.replace(/\s/g, "")}`, label: "Phone" },
              { icon: GithubIcon, href: contact.github, label: "GitHub" },
              { icon: LinkedinIcon, href: contact.linkedin, label: "LinkedIn" },
            ].map((c) => (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                aria-label={c.label}
                className="w-11 h-11 rounded-2xl card-soft flex items-center justify-center hover:-translate-y-0.5 transition"
              >
                <c.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        )}
      </section>

      {/* PROFILE */}
      {profile && (
        <section id="profile" className="px-6 py-24 max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <Reveal>
              <SectionLabel>{profile.eyebrow}</SectionLabel>
              <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.05]">
                {profile.title}
              </h2>
              <p className="mt-6 text-muted-foreground leading-relaxed">{profile.body}</p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" />
                  {hero.location}
                </span>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="card-soft rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                  <span className="traffic-dots">
                    <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                    <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                  </span>
                  <span className="text-xs text-muted-foreground font-mono ml-2">
                    profile.status
                  </span>
                </div>
                <div className="p-6 space-y-5 font-mono text-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Role Focus
                    </p>
                    <p className="text-foreground mt-1">{profile.roleFocus}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Core Stack
                    </p>
                    <p className="text-foreground mt-1">{profile.coreStack}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Available for internship opportunities
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* PROJECTS */}
      <section id="projects" className="px-6 py-24 max-w-6xl mx-auto">
        <Reveal>
          <SectionLabel>Selected Work</SectionLabel>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-12">Projects.</h2>
        </Reveal>
        <div className="grid md:grid-cols-2 gap-5">
          {projects.map((p, i) => (
            <Reveal key={p.name + i} delay={i * 0.05}>
              <article className="card-soft rounded-2xl p-7 h-full group hover:-translate-y-1 transition">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    {p.tag}
                  </p>
                  {p.inProgress && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                      In progress
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-semibold mt-1 mb-3">{p.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  {p.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {p.tech.map((t) => (
                    <span
                      key={t}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SKILLS */}
      <section id="skills" className="px-6 py-24 max-w-6xl mx-auto">
        <Reveal>
          <SectionLabel>Toolkit</SectionLabel>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-12">Skills.</h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {skills.map((g, i) => {
            const Icon = skillIconMap[g.label] || Sparkles;
            return (
              <Reveal key={g.label} delay={i * 0.04}>
                <div className="card-soft rounded-2xl p-6 h-full">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-medium">{g.label}</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {g.skills.map((s) => (
                      <span
                        key={s}
                        className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* EDUCATION + CERTS */}
      <section id="education" className="px-6 py-24 max-w-6xl mx-auto">
        <Reveal>
          <SectionLabel>Background</SectionLabel>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-12">
            Education & certifications.
          </h2>
        </Reveal>
        <div className="grid lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 space-y-4">
            {education.map((e, i) => (
              <Reveal key={e.title + i} delay={i * 0.04}>
                <div className="card-soft rounded-2xl p-5 flex gap-5 items-start">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-muted flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-medium">{e.title}</h3>
                      <span className="text-xs text-muted-foreground">{e.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{e.org}</p>
                    {e.notes && (
                      <p className="text-xs text-muted-foreground/80 mt-2 leading-relaxed">
                        {e.notes}
                      </p>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="lg:col-span-2">
            <Reveal delay={0.1}>
              <div className="card-soft rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  <Award className="w-5 h-5" />
                  <h3 className="font-medium">Certifications</h3>
                </div>
                <ul className="space-y-4">
                  {certs.map((c, i) => (
                    <li key={c.title + i} className="flex gap-3 text-sm">
                      <BadgeCheck className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium leading-snug">{c.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {c.issuer}
                          {c.year ? ` · ${c.year}` : ""}
                        </p>
                        {c.url && (
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-foreground/70 hover:text-foreground mt-1"
                          >
                            View <ExternalLink className="w-3 h-3" />
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
      {contact && (
        <section id="contact" className="px-6 py-24 max-w-5xl mx-auto">
          <Reveal>
            <div className="card-soft rounded-3xl p-10 sm:p-14 text-center">
              <SectionLabel>Contact</SectionLabel>
              <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-3">
                Let's build something.
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Open to internship roles and conversations with HR & engineering teams.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 mt-9 max-w-2xl mx-auto text-left">
                {[
                  {
                    Icon: Mail,
                    label: "Email",
                    value: contact.email,
                    href: `mailto:${contact.email}`,
                  },
                  {
                    Icon: Phone,
                    label: "Phone",
                    value: contact.phone,
                    href: `tel:${contact.phone.replace(/\s/g, "")}`,
                  },
                  {
                    Icon: LinkedinIcon,
                    label: "LinkedIn",
                    value: contact.linkedin.replace(/^https?:\/\//, ""),
                    href: contact.linkedin,
                  },
                  {
                    Icon: GithubIcon,
                    label: "GitHub",
                    value: contact.github.replace(/^https?:\/\//, ""),
                    href: contact.github,
                  },
                ].map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    target={l.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="rounded-2xl p-4 flex items-center gap-4 bg-muted/40 hover:bg-muted transition group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center">
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
          </Reveal>
        </section>
      )}

      <footer className="px-6 py-10 flex justify-center items-center text-center text-xs text-muted-foreground max-w-6xl mx-auto">
        <span>
          © {new Date().getFullYear()} {hero.name}
        </span>
      </footer>
    </div>
  );
}
