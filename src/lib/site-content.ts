import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type HeroContent = {
  name: string;
  avatarUrl?: string;
  siteIconUrl?: string;
  eyebrow: string;
  tagline: string;
  location: string;
  stats: { value: string; label: string }[];
};
export type ProfileContent = {
  eyebrow: string;
  title: string;
  body: string;
  roleFocus: string;
  coreStack: string;
};
export type SkillsContent = { items: { label: string; skills: string[] }[] };
export type ProjectItem = {
  name: string;
  tag: string;
  description: string;
  tech: string[];
  inProgress: boolean;
};
export type ProjectsContent = { items: ProjectItem[] };
export type EducationItem = { title: string; org: string; period: string; notes: string };
export type EducationContent = { items: EducationItem[] };
export type CertItem = { title: string; issuer: string; year: string; url: string };
export type CertificationsContent = { items: CertItem[] };
export type ContactContent = {
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  cvUrl: string;
};

export type SiteContentMap = {
  hero: HeroContent;
  profile: ProfileContent;
  skills: SkillsContent;
  projects: ProjectsContent;
  education: EducationContent;
  certifications: CertificationsContent;
  contact: ContactContent;
};

export const SECTION_KEYS = [
  "hero",
  "profile",
  "skills",
  "projects",
  "education",
  "certifications",
  "contact",
] as const;

async function fetchAllContent(): Promise<Partial<SiteContentMap>> {
  const { data, error } = await supabase.from("site_content").select("section, value");
  if (error) throw error;
  const map: Record<string, unknown> = {};
  for (const row of data ?? []) map[row.section] = row.value;
  return map as Partial<SiteContentMap>;
}

export const siteContentQueryOptions = queryOptions({
  queryKey: ["site_content"],
  queryFn: fetchAllContent,
  staleTime: 60_000,
});

export function useSiteContent() {
  return useQuery(siteContentQueryOptions);
}

export const DEFAULT_CONTENT: SiteContentMap = {
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
