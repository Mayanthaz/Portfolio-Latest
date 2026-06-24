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
