import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  siteContentQueryOptions,
  useSiteContent,
  SECTION_KEYS,
  type SiteContentMap,
} from "@/lib/site-content";
import { ThemeToggle } from "@/lib/theme";
import { ArrowLeft, ImagePlus, LogOut, Save, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [{ title: "Admin · Manage content" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(siteContentQueryOptions),
  component: AdminPage,
});

const SECTION_LABELS: Record<(typeof SECTION_KEYS)[number], string> = {
  hero: "Hero",
  profile: "Profile",
  skills: "Skills",
  projects: "Projects",
  education: "Education",
  certifications: "Certifications",
  contact: "Contact",
};

function AdminPage() {
  const navigate = useNavigate();
  const { data } = useSiteContent();
  const [activeSection, setActiveSection] = useState<(typeof SECTION_KEYS)[number]>("hero");

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-sm flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" /> View site
            </Link>
            <span className="text-sm font-medium">Admin Panel</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={handleSignOut}
              className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-full card-soft hover:bg-accent"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 grid lg:grid-cols-[220px_1fr] gap-8">
        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
          {SECTION_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`text-left text-sm px-3 py-2 rounded-lg transition whitespace-nowrap ${
                activeSection === key
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent text-muted-foreground hover:text-foreground"
              }`}
            >
              {SECTION_LABELS[key]}
            </button>
          ))}
        </nav>

        <div className="min-w-0">
          {data && (
            <SectionEditor
              key={activeSection}
              section={activeSection}
              value={data[activeSection]}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function SectionEditor<K extends (typeof SECTION_KEYS)[number]>({
  section,
  value,
}: {
  section: K;
  value: SiteContentMap[K] | undefined;
}) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<SiteContentMap[K] | undefined>(value);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(value);
    setSaved(false);
  }, [value, section]);

  const save = useMutation({
    mutationFn: async (next: unknown) => {
      const { error } = await supabase
        .from("site_content")
        .upsert({ section, value: next as never });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site_content"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  if (!draft) return <div className="text-muted-foreground text-sm">Loading…</div>;

  return (
    <div className="card-soft rounded-2xl p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">{SECTION_LABELS[section]}</h2>
          <p className="text-xs text-muted-foreground mt-1">Edit the {section} template.</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-xs text-emerald-600 dark:text-emerald-400">Saved ✓</span>}
          {save.error && (
            <span className="max-w-64 text-right text-xs text-destructive">
              Save failed. Please sign in again and retry.
            </span>
          )}
          <button
            disabled={save.isPending}
            onClick={() => save.mutate(draft)}
            className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {save.isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {/* Section-specific forms */}
      {section === "hero" && (
        <HeroForm value={draft as SiteContentMap["hero"]} onChange={(v) => setDraft(v as never)} />
      )}
      {section === "profile" && (
        <ProfileForm
          value={draft as SiteContentMap["profile"]}
          onChange={(v) => setDraft(v as never)}
        />
      )}
      {section === "skills" && (
        <ListForm
          value={(draft as SiteContentMap["skills"]).items}
          empty={{ label: "Category", skills: [] as string[] }}
          onChange={(items) => setDraft({ items } as never)}
          render={(item, set) => (
            <div className="space-y-3">
              <TextField
                label="Category"
                value={item.label}
                onChange={(v) => set({ ...item, label: v })}
              />
              <ArrayField
                label="Skills"
                value={item.skills}
                onChange={(skills) => set({ ...item, skills })}
              />
            </div>
          )}
        />
      )}
      {section === "projects" && (
        <ListForm
          value={(draft as SiteContentMap["projects"]).items}
          empty={{ name: "", tag: "", description: "", tech: [] as string[], inProgress: false }}
          onChange={(items) => setDraft({ items } as never)}
          render={(item, set) => (
            <div className="space-y-3">
              <TextField
                label="Name"
                value={item.name}
                onChange={(v) => set({ ...item, name: v })}
              />
              <TextField label="Tag" value={item.tag} onChange={(v) => set({ ...item, tag: v })} />
              <TextField
                label="Description"
                textarea
                value={item.description}
                onChange={(v) => set({ ...item, description: v })}
              />
              <ArrayField
                label="Tech"
                value={item.tech}
                onChange={(tech) => set({ ...item, tech })}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={item.inProgress}
                  onChange={(e) => set({ ...item, inProgress: e.target.checked })}
                />
                In progress
              </label>
            </div>
          )}
        />
      )}
      {section === "education" && (
        <ListForm
          value={(draft as SiteContentMap["education"]).items}
          empty={{ title: "", org: "", period: "", notes: "" }}
          onChange={(items) => setDraft({ items } as never)}
          render={(item, set) => (
            <div className="space-y-3">
              <TextField
                label="Title"
                value={item.title}
                onChange={(v) => set({ ...item, title: v })}
              />
              <TextField
                label="Organisation"
                value={item.org}
                onChange={(v) => set({ ...item, org: v })}
              />
              <TextField
                label="Period"
                value={item.period}
                onChange={(v) => set({ ...item, period: v })}
              />
              <TextField
                label="Notes"
                textarea
                value={item.notes}
                onChange={(v) => set({ ...item, notes: v })}
              />
            </div>
          )}
        />
      )}
      {section === "certifications" && (
        <ListForm
          value={(draft as SiteContentMap["certifications"]).items}
          empty={{ title: "", issuer: "", year: "", url: "" }}
          onChange={(items) => setDraft({ items } as never)}
          render={(item, set) => (
            <div className="space-y-3">
              <TextField
                label="Title"
                value={item.title}
                onChange={(v) => set({ ...item, title: v })}
              />
              <TextField
                label="Issuer"
                value={item.issuer}
                onChange={(v) => set({ ...item, issuer: v })}
              />
              <TextField
                label="Year"
                value={item.year}
                onChange={(v) => set({ ...item, year: v })}
              />
              <TextField
                label="URL (optional)"
                value={item.url}
                onChange={(v) => set({ ...item, url: v })}
              />
            </div>
          )}
        />
      )}
      {section === "contact" && (
        <ContactForm
          value={draft as SiteContentMap["contact"]}
          onChange={(v) => setDraft(v as never)}
        />
      )}
    </div>
  );
}

/* ---------- Field primitives ---------- */

function TextField({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-xl bg-muted border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-xl bg-muted border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      )}
    </div>
  );
}

function ArrayField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="mt-1 flex flex-wrap gap-1.5 items-center p-2 rounded-xl bg-muted border border-border min-h-[44px]">
        {value.map((v, i) => (
          <span
            key={i}
            className="text-xs px-2 py-1 rounded-md bg-background flex items-center gap-1.5"
          >
            {v}
            <button onClick={() => onChange(value.filter((_, idx) => idx !== i))}>
              <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
            </button>
          </span>
        ))}
        <input
          placeholder="Type and press Enter"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const v = e.currentTarget.value.trim();
              if (v) {
                onChange([...value, v]);
                e.currentTarget.value = "";
              }
            }
          }}
          className="flex-1 min-w-[120px] bg-transparent text-sm focus:outline-none px-1"
        />
      </div>
    </div>
  );
}

function ListForm<T>({
  value,
  onChange,
  render,
  empty,
}: {
  value: T[];
  onChange: (v: T[]) => void;
  render: (item: T, set: (next: T) => void) => React.ReactNode;
  empty: T;
}) {
  return (
    <div className="space-y-4">
      {value.map((item, i) => (
        <div key={i} className="rounded-xl border border-border p-4 bg-muted/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground">Item {i + 1}</span>
            <button
              onClick={() => onChange(value.filter((_, idx) => idx !== i))}
              className="text-xs flex items-center gap-1 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove
            </button>
          </div>
          {render(item, (next) => onChange(value.map((it, idx) => (idx === i ? next : it))))}
        </div>
      ))}
      <button
        onClick={() => onChange([...value, structuredClone(empty)])}
        className="w-full rounded-xl border border-dashed border-border py-3 text-sm text-muted-foreground hover:bg-accent flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Add item
      </button>
    </div>
  );
}

/* ---------- Section-specific forms ---------- */

function HeroForm({
  value,
  onChange,
}: {
  value: SiteContentMap["hero"];
  onChange: (v: SiteContentMap["hero"]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [iconUploading, setIconUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadInfo, setUploadInfo] = useState<string | null>(null);
  const [iconUploadError, setIconUploadError] = useState<string | null>(null);
  const [iconUploadInfo, setIconUploadInfo] = useState<string | null>(null);

  async function uploadAvatar(file: File) {
    setUploadError(null);
    setUploadInfo(null);

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadError("Choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("The image must be smaller than 5 MB.");
      return;
    }

    setUploading(true);
    try {
      const path = "header/avatar";
      const { error } = await supabase.storage.from("portfolio-assets").upload(path, file, {
        upsert: true,
        contentType: file.type,
        cacheControl: "3600",
      });
      if (error) throw error;

      const { data } = supabase.storage.from("portfolio-assets").getPublicUrl(path);
      onChange({ ...value, avatarUrl: `${data.publicUrl}?v=${Date.now()}` });
      setUploadInfo("Image uploaded. Click Save to publish it.");
    } catch {
      setUploadError("Image upload failed. Check the storage migration and retry.");
    } finally {
      setUploading(false);
    }
  }

  async function uploadSiteIcon(file: File) {
    setIconUploadError(null);
    setIconUploadInfo(null);

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setIconUploadError("Choose a PNG, JPG, or WebP image.");
      return;
    }
    if (file.size > 1024 * 1024) {
      setIconUploadError("The icon must be smaller than 1 MB.");
      return;
    }

    setIconUploading(true);
    try {
      const path = "site/favicon";
      const { error } = await supabase.storage.from("portfolio-assets").upload(path, file, {
        upsert: true,
        contentType: file.type,
        cacheControl: "3600",
      });
      if (error) throw error;

      const { data } = supabase.storage.from("portfolio-assets").getPublicUrl(path);
      onChange({ ...value, siteIconUrl: `${data.publicUrl}?v=${Date.now()}` });
      setIconUploadInfo("Icon uploaded. Click Save to publish it.");
    } catch {
      setIconUploadError("Icon upload failed. Apply the storage migration and retry.");
    } finally {
      setIconUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Header profile image
        </label>
        <div className="mt-2 flex flex-wrap items-center gap-4 rounded-xl border border-border bg-muted/30 p-4">
          <img
            src={value.avatarUrl || "/favicon.svg"}
            alt="Header profile preview"
            className="h-16 w-16 rounded-full border border-border bg-background object-cover"
          />
          <div className="min-w-0 flex-1">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
              <ImagePlus className="h-4 w-4" />
              {uploading ? "Uploading…" : "Choose image"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploading}
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadAvatar(file);
                  event.currentTarget.value = "";
                }}
              />
            </label>
            <p className="mt-2 text-xs text-muted-foreground">JPG, PNG, or WebP. Maximum 5 MB.</p>
            {uploadError && <p className="mt-1 text-xs text-destructive">{uploadError}</p>}
            {uploadInfo && (
              <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">{uploadInfo}</p>
            )}
          </div>
        </div>
      </div>
      <div>
        <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Browser tab icon
        </label>
        <div className="mt-2 flex flex-wrap items-center gap-4 rounded-xl border border-border bg-muted/30 p-4">
          <img
            src={value.siteIconUrl || "/favicon.svg"}
            alt="Browser tab icon preview"
            className="h-12 w-12 rounded-full border border-border bg-background object-cover"
          />
          <div className="min-w-0 flex-1">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
              <ImagePlus className="h-4 w-4" />
              {iconUploading ? "Uploading…" : "Choose icon"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={iconUploading}
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadSiteIcon(file);
                  event.currentTarget.value = "";
                }}
              />
            </label>
            <p className="mt-2 text-xs text-muted-foreground">
              Use a square PNG, JPG, or WebP. Maximum 1 MB.
            </p>
            {iconUploadError && <p className="mt-1 text-xs text-destructive">{iconUploadError}</p>}
            {iconUploadInfo && (
              <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                {iconUploadInfo}
              </p>
            )}
          </div>
        </div>
      </div>
      <TextField
        label="Name"
        value={value.name}
        onChange={(v) => onChange({ ...value, name: v })}
      />
      <TextField
        label="Eyebrow"
        value={value.eyebrow}
        onChange={(v) => onChange({ ...value, eyebrow: v })}
      />
      <TextField
        label="Tagline"
        textarea
        value={value.tagline}
        onChange={(v) => onChange({ ...value, tagline: v })}
      />
      <TextField
        label="Location"
        value={value.location}
        onChange={(v) => onChange({ ...value, location: v })}
      />
      <div>
        <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Stat cards
        </label>
        <ListForm
          value={value.stats}
          empty={{ value: "", label: "" }}
          onChange={(stats) => onChange({ ...value, stats })}
          render={(item, set) => (
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Value"
                value={item.value}
                onChange={(v) => set({ ...item, value: v })}
              />
              <TextField
                label="Label"
                value={item.label}
                onChange={(v) => set({ ...item, label: v })}
              />
            </div>
          )}
        />
      </div>
    </div>
  );
}

function ProfileForm({
  value,
  onChange,
}: {
  value: SiteContentMap["profile"];
  onChange: (v: SiteContentMap["profile"]) => void;
}) {
  return (
    <div className="space-y-3">
      <TextField
        label="Eyebrow"
        value={value.eyebrow}
        onChange={(v) => onChange({ ...value, eyebrow: v })}
      />
      <TextField
        label="Title"
        value={value.title}
        onChange={(v) => onChange({ ...value, title: v })}
      />
      <TextField
        label="Body"
        textarea
        value={value.body}
        onChange={(v) => onChange({ ...value, body: v })}
      />
      <TextField
        label="Role focus"
        value={value.roleFocus}
        onChange={(v) => onChange({ ...value, roleFocus: v })}
      />
      <TextField
        label="Core stack"
        value={value.coreStack}
        onChange={(v) => onChange({ ...value, coreStack: v })}
      />
    </div>
  );
}

function ContactForm({
  value,
  onChange,
}: {
  value: SiteContentMap["contact"];
  onChange: (v: SiteContentMap["contact"]) => void;
}) {
  return (
    <div className="space-y-3">
      <TextField
        label="Email"
        value={value.email}
        onChange={(v) => onChange({ ...value, email: v })}
      />
      <TextField
        label="Phone"
        value={value.phone}
        onChange={(v) => onChange({ ...value, phone: v })}
      />
      <TextField
        label="LinkedIn URL"
        value={value.linkedin}
        onChange={(v) => onChange({ ...value, linkedin: v })}
      />
      <TextField
        label="GitHub URL"
        value={value.github}
        onChange={(v) => onChange({ ...value, github: v })}
      />
      <TextField
        label="CV file path"
        value={value.cvUrl}
        onChange={(v) => onChange({ ...value, cvUrl: v })}
      />
    </div>
  );
}
