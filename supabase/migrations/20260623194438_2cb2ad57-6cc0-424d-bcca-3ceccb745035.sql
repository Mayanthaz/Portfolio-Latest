
-- Admin email check
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
      AND encode(
        extensions.digest(convert_to(lower(email), 'UTF8'), 'sha256'),
        'hex'
      ) = '5707013f5c5b7818f7f608748214ebd19f9621750736c0cacce6b8ed9da2e345'
  );
$$;

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Content table (one JSON template per section)
CREATE TABLE public.site_content (
  section text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site content"
  ON public.site_content FOR SELECT
  USING (true);

CREATE POLICY "Admin can insert site content"
  ON public.site_content FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update site content"
  ON public.site_content FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete site content"
  ON public.site_content FOR DELETE
  TO authenticated USING (public.is_admin());

CREATE TRIGGER trg_site_content_updated
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed from CV
INSERT INTO public.site_content (section, value) VALUES
('hero', '{
  "name": "Mayantha Udayanga",
  "eyebrow": "Software Engineering Undergraduate",
  "tagline": "I build clean full-stack, mobile, desktop, and database-driven applications with a focus on practical workflows, reliable APIs, and polished user interfaces.",
  "location": "Sri Lanka",
  "stats": [
    {"value": "4", "label": "Product builds"},
    {"value": "Full stack", "label": "Spring Boot, Node.js, .NET"},
    {"value": "Intern-ready", "label": "Available immediately"}
  ]
}'::jsonb),
('profile', '{
  "eyebrow": "Profile",
  "title": "Intern-ready engineer with a product mindset.",
  "body": "Second-year Software Engineering undergraduate at the National Institute of Business Management. Experienced in academic full-stack, mobile, desktop, database-driven and API-based application development. I care about clean code, OOP, MVC structure, REST integration, and shipping reliable features within team workflows.",
  "roleFocus": "Full Stack Software Engineering Intern",
  "coreStack": "Java · Spring Boot · Node.js · .NET · SQL · React"
}'::jsonb),
('skills', '{
  "items": [
    {"label": "Languages", "skills": ["Java", "JavaScript", "SQL", "C#", "C", "C++"]},
    {"label": "Backend", "skills": ["Spring Boot", "Node.js", ".NET", "REST APIs", "MVC", "CRUD"]},
    {"label": "Frontend", "skills": ["HTML", "CSS", "JavaScript", "Responsive UI"]},
    {"label": "Databases", "skills": ["SQL", "Schema Design", "Queries", "Integration"]},
    {"label": "Tools", "skills": ["Git", "GitHub", "VS Code", "Android Studio", "Docker"]},
    {"label": "Cloud", "skills": ["AWS Solutions Architect (in progress)"]}
  ]
}'::jsonb),
('projects', '{
  "items": [
    {"name": "LUXE", "tag": "Full-Stack Hotel Management", "description": "Java + Spring Boot hotel management system with REST APIs and SQL. 4+ CRUD modules covering reservations, customers, rooms, and admin operations following OOP and MVC.", "tech": ["Java", "Spring Boot", "REST", "SQL", "MVC"], "inProgress": false},
    {"name": "InstaTute", "tag": "Learning Management Platform", "description": "Web-based LMS connecting institutions, tutors, and students. Designed data-driven workflows for tutor management, student records, and institution operations.", "tech": ["Full-Stack", "Web App", "DB Design"], "inProgress": false},
    {"name": "EZKEY", "tag": "Digital Product Mobile App", "description": "Mobile app for digital product sales with listing, secure purchasing flow, warranty support, product management and validation testing.", "tech": ["Android", "Mobile", "CRUD"], "inProgress": true},
    {"name": "Library Management", "tag": "Windows Desktop Application", "description": "Desktop application to manage books, records and administrative tasks. Form validation, search, update, delete, debugging and software testing practices.", "tech": ["C#", ".NET", "Desktop", "SQL"], "inProgress": false}
  ]
}'::jsonb),
('education', '{
  "items": [
    {"title": "BSc (Hons) Software Engineering", "org": "National Institute of Business Management", "period": "Undergraduate", "notes": "Pursuing honours degree alongside applied projects."},
    {"title": "Higher National Diploma in Software Engineering", "org": "NIBM", "period": "2026 – Present", "notes": "Enterprise App Development 2, Mobile, DSA, IoT & Robotics."},
    {"title": "Diploma in Software Engineering", "org": "NIBM · GPA 3.3 / 4.0", "period": "2024 – 2025", "notes": "Full-Stack Web, Database Management, Enterprise App Dev 1."},
    {"title": "G.C.E. A/L — Mathematics Stream", "org": "General English: B · ICT: B", "period": "2023", "notes": ""}
  ]
}'::jsonb),
('certifications', '{
  "items": [
    {"title": "Introduction to Cybersecurity", "issuer": "Cisco", "year": "2024", "url": ""},
    {"title": "Share Data Using Google Data Analytics", "issuer": "Google Cloud", "year": "2024", "url": ""},
    {"title": "AWS Solutions Architect — Associate", "issuer": "Amazon Web Services", "year": "In progress", "url": ""}
  ]
}'::jsonb),
('contact', '{
  "email": "mayantha743@gmail.com",
  "phone": "+94 78 368 6802",
  "linkedin": "https://linkedin.com/in/mayanthaudayanga",
  "github": "https://github.com/Mayanthaz",
  "cvUrl": "/Mayantha_Udayanga_CV.pdf"
}'::jsonb);
