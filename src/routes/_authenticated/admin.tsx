import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  siteContentQueryOptions,
  useSiteContent,
  DEFAULT_CONTENT,
  SECTION_KEYS,
  type SiteContentMap,
} from "@/lib/site-content";
import { ThemeToggle } from "@/lib/theme";
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Award,
  Check,
  FolderGit2,
  GraduationCap,
  ImagePlus,
  Loader2,
  LogOut,
  Mail,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  User,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [{ title: "Admin · Manage content" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  // Never block the admin on a failed content fetch; the page shows a retry notice instead.
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(siteContentQueryOptions).catch(() => undefined),
  component: AdminPage,
});

type SectionKey = (typeof SECTION_KEYS)[number];

const SECTIONS: Record<SectionKey, { label: string; hint: string; icon: LucideIcon }> = {
  hero: { label: "Hero", hint: "Name, tagline, images and headline stats.", icon: Sparkles },
  profile: { label: "Profile", hint: "The about-me block and role focus.", icon: User },
  skills: { label: "Skills", hint: "Skill categories shown as cards.", icon: Wrench },
  projects: { label: "Projects", hint: "Selected work, shown in order.", icon: FolderGit2 },
  education: { label: "Education", hint: "Degrees, diplomas and results.", icon: GraduationCap },
  certifications: { label: "Certifications", hint: "Certificates and badges.", icon: Award },
  contact: { label: "Contact", hint: "Links and details visitors can use.", icon: Mail },
};

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function without<T extends object>(obj: T, key: keyof T): T {
  const next = { ...obj };
  delete next[key];
  return next;
}

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data, isError, refetch, isFetching } = useSiteContent();
  const [activeSection, setActiveSection] = useState<SectionKey>("hero");
  const [drafts, setDrafts] = useState<Partial<SiteContentMap>>({});

  const published = useMemo(
    () => ({ ...DEFAULT_CONTENT, ...(data ?? {}) }) as SiteContentMap,
    [data],
  );
  const isDirty = (key: SectionKey) => key in drafts && !same(drafts[key], published[key]);
  const anyDirty = SECTION_KEYS.some(isDirty);

  useEffect(() => {
    if (!anyDirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [anyDirty]);

  async function handleSignOut() {
    if (anyDirty && !window.confirm("You have unsaved changes. Sign out anyway?")) return;
    sessionStorage.removeItem("admin_authenticated");
    await supabase.auth.signOut();
    qc.clear();
    navigate({ to: "/auth" });
  }

  const Icon = SECTIONS[activeSection].icon;

  return (
    <div className="relative min-h-screen bg-background">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[30rem] overflow-hidden pointer-events-none"
      >
        <div className="aurora aurora-a" />
        <div className="aurora aurora-b" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
      </div>
      <header className="sticky top-4 z-40 px-4">
        <div className="glass max-w-6xl mx-auto rounded-full pl-5 pr-2 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-5 min-w-0">
            <Link
              to="/"
              className="text-sm flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">View site</span>
            </Link>
            <span className="h-5 w-px bg-border" />
            <span className="text-sm font-semibold tracking-tight">
              Admin <span className="text-gradient">Panel</span>
            </span>
            {anyDirty && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-current" /> Unsaved changes
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={handleSignOut}
              className="text-sm flex items-center gap-1.5 h-10 px-4 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-12 grid lg:grid-cols-[230px_1fr] gap-6 lg:gap-10">
        <nav
          aria-label="Sections"
          className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible lg:sticky lg:top-24 lg:self-start -mx-4 px-4 sm:mx-0 sm:px-0 pb-1"
        >
          {SECTION_KEYS.map((key) => {
            const { label, icon: NavIcon } = SECTIONS[key];
            const active = activeSection === key;
            return (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                aria-current={active ? "page" : undefined}
                className={`relative flex items-center gap-2.5 text-left text-sm px-3 py-2.5 rounded-xl transition-all duration-200 whitespace-nowrap ${
                  active
                    ? "bg-foreground/[0.08] text-foreground font-medium [&_svg]:text-brand"
                    : "hover:bg-accent text-muted-foreground hover:text-foreground"
                }`}
              >
                <NavIcon className="w-4 h-4 shrink-0" />
                {label}
                {isDirty(key) && (
                  <span
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-500"
                    title="Unsaved changes"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="min-w-0">
          {!data && isError ? (
            <div className="card-soft rounded-2xl p-10 text-center space-y-4">
              <AlertCircle className="w-6 h-6 mx-auto text-destructive" />
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Couldn&apos;t load content from the database. Check the Supabase URL and key used by
                this deploy, and that the setup SQL has been run.
              </p>
              <button
                onClick={() => void refetch()}
                disabled={isFetching}
                className="h-10 px-5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-60"
              >
                {isFetching ? "Retrying…" : "Retry"}
              </button>
            </div>
          ) : !data ? (
            <div className="card-soft rounded-2xl p-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading content…
            </div>
          ) : (
            <SectionEditor
              key={activeSection}
              section={activeSection}
              icon={Icon}
              isPublished={activeSection in data}
              draft={drafts[activeSection] ?? published[activeSection]}
              dirty={isDirty(activeSection)}
              onChange={(next) => setDrafts((d) => ({ ...d, [activeSection]: next }))}
              onDiscard={() => setDrafts((d) => without(d, activeSection))}
              onSaved={() => setDrafts((d) => without(d, activeSection))}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function SectionEditor<K extends SectionKey>({
  section,
  icon: Icon,
  isPublished,
  draft,
  dirty,
  onChange,
  onDiscard,
  onSaved,
}: {
  section: K;
  icon: LucideIcon;
  isPublished: boolean;
  draft: SiteContentMap[K];
  dirty: boolean;
  onChange: (v: SiteContentMap[K]) => void;
  onDiscard: () => void;
  onSaved: () => void;
}) {
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(savedTimer.current), []);

  const save = useMutation({
    mutationFn: async (next: SiteContentMap[K]) => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("Your session expired. Sign out and sign in again.");
      }
      const { error } = await supabase
        .from("site_content")
        .upsert({ section, value: next as never });
      if (error) throw new Error(error.message || "Database rejected the save.");
      return next;
    },
    onSuccess: (next) => {
      qc.setQueryData<Partial<SiteContentMap>>(["site_content"], (old) => ({
        ...(old ?? {}),
        [section]: next,
      }));
      qc.invalidateQueries({ queryKey: ["site_content"] });
      onSaved();
      setSaved(true);
      clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaved(false), 2500);
    },
  });

  const canSave = (dirty || !isPublished) && !save.isPending;
  const saveRef = useRef<() => void>(() => {});
  saveRef.current = () => {
    if (canSave) save.mutate(draft);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const set = (v: unknown) => onChange(v as SiteContentMap[K]);
  const errorMessage =
    (save.error as { message?: string } | null)?.message ||
    "Save failed. Please sign in again and retry.";

  return (
    <div className="card-soft gradient-border rounded-2xl overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-7 border-b border-border">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand/20 to-brand-2/15 text-brand flex items-center justify-center shrink-0">
            <Icon className="w-[18px] h-[18px]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold leading-tight">{SECTIONS[section].label}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{SECTIONS[section].hint}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {dirty && (
            <button
              onClick={onDiscard}
              disabled={save.isPending}
              className="h-9 px-3.5 rounded-full text-sm flex items-center gap-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Discard
            </button>
          )}
          <button
            disabled={!canSave}
            onClick={() => save.mutate(draft)}
            title="Save (Ctrl+S)"
            className="h-9 rounded-full bg-primary text-primary-foreground px-5 text-sm font-medium hover:opacity-90 active:scale-[0.97] transition disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2"
          >
            {save.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {save.isPending ? "Saving…" : saved ? "Saved" : "Save changes"}
          </button>
        </div>
      </div>

      {(save.error || !isPublished) && (
        <div
          role="alert"
          className={`mx-5 sm:mx-7 mt-5 flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs ${
            save.error
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
          {save.error
            ? errorMessage
            : "This section isn't published yet. The site is showing built-in defaults — save to publish your version."}
        </div>
      )}

      <div className="p-5 sm:p-7">
        {section === "hero" && <HeroForm value={draft as SiteContentMap["hero"]} onChange={set} />}
        {section === "profile" && (
          <ProfileForm value={draft as SiteContentMap["profile"]} onChange={set} />
        )}
        {section === "skills" && (
          <ListForm
            noun="category"
            value={(draft as SiteContentMap["skills"]).items}
            empty={{ label: "", skills: [] as string[] }}
            title={(item) => item.label}
            onChange={(items) => set({ items })}
            render={(item, upd) => (
              <div className="space-y-4">
                <TextField
                  label="Category"
                  value={item.label}
                  onChange={(v) => upd({ ...item, label: v })}
                />
                <ArrayField
                  label="Skills"
                  value={item.skills}
                  onChange={(skills) => upd({ ...item, skills })}
                />
              </div>
            )}
          />
        )}
        {section === "projects" && (
          <ListForm
            noun="project"
            value={(draft as SiteContentMap["projects"]).items}
            empty={{ name: "", tag: "", description: "", tech: [] as string[], inProgress: false }}
            title={(item) => item.name}
            onChange={(items) => set({ items })}
            render={(item, upd) => (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <TextField
                    label="Name"
                    value={item.name}
                    onChange={(v) => upd({ ...item, name: v })}
                  />
                  <TextField
                    label="Tag"
                    value={item.tag}
                    onChange={(v) => upd({ ...item, tag: v })}
                  />
                </div>
                <TextField
                  label="Description"
                  textarea
                  value={item.description}
                  onChange={(v) => upd({ ...item, description: v })}
                />
                <ArrayField
                  label="Tech"
                  value={item.tech}
                  onChange={(tech) => upd({ ...item, tech })}
                />
                <label className="flex items-center gap-2.5 text-sm cursor-pointer w-fit">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[var(--primary)]"
                    checked={item.inProgress}
                    onChange={(e) => upd({ ...item, inProgress: e.target.checked })}
                  />
                  Mark as in progress
                </label>
              </div>
            )}
          />
        )}
        {section === "education" && (
          <ListForm
            noun="entry"
            value={(draft as SiteContentMap["education"]).items}
            empty={{ title: "", org: "", period: "", notes: "" }}
            title={(item) => item.title}
            onChange={(items) => set({ items })}
            render={(item, upd) => (
              <div className="space-y-4">
                <TextField
                  label="Title"
                  value={item.title}
                  onChange={(v) => upd({ ...item, title: v })}
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <TextField
                    label="Organisation"
                    value={item.org}
                    onChange={(v) => upd({ ...item, org: v })}
                  />
                  <TextField
                    label="Period"
                    value={item.period}
                    onChange={(v) => upd({ ...item, period: v })}
                  />
                </div>
                <TextField
                  label="Notes"
                  textarea
                  value={item.notes}
                  onChange={(v) => upd({ ...item, notes: v })}
                />
              </div>
            )}
          />
        )}
        {section === "certifications" && (
          <ListForm
            noun="certification"
            value={(draft as SiteContentMap["certifications"]).items}
            empty={{ title: "", issuer: "", year: "", url: "" }}
            title={(item) => item.title}
            onChange={(items) => set({ items })}
            render={(item, upd) => (
              <div className="space-y-4">
                <TextField
                  label="Title"
                  value={item.title}
                  onChange={(v) => upd({ ...item, title: v })}
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <TextField
                    label="Issuer"
                    value={item.issuer}
                    onChange={(v) => upd({ ...item, issuer: v })}
                  />
                  <TextField
                    label="Year"
                    value={item.year}
                    onChange={(v) => upd({ ...item, year: v })}
                  />
                </div>
                <TextField
                  label="URL (optional)"
                  value={item.url}
                  onChange={(v) => upd({ ...item, url: v })}
                />
              </div>
            )}
          />
        )}
        {section === "contact" && (
          <ContactForm value={draft as SiteContentMap["contact"]} onChange={set} />
        )}
      </div>
    </div>
  );
}

/* ---------- Field primitives ---------- */

function TextField({
  label,
  value,
  onChange,
  textarea,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  placeholder?: string;
}) {
  const id = useMemo(() => `f-${Math.random().toString(36).slice(2, 9)}`, []);
  return (
    <div>
      <label
        htmlFor={id}
        className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
      >
        {label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="field mt-1.5 resize-y leading-relaxed"
        />
      ) : (
        <input
          id={id}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="field mt-1.5"
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
  const [text, setText] = useState("");

  function commit(raw: string) {
    const parts = raw
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p && !value.includes(p));
    if (parts.length) onChange([...value, ...parts]);
    setText("");
  }

  return (
    <div>
      <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <div className="field mt-1.5 flex flex-wrap gap-1.5 items-center !p-2 min-h-[46px]">
        {value.map((v, i) => (
          <span
            key={`${v}-${i}`}
            className="text-xs pl-2.5 pr-1 py-1 rounded-full bg-muted flex items-center gap-1"
          >
            {v}
            <button
              type="button"
              aria-label={`Remove ${v}`}
              onClick={() => onChange(value.filter((_, idx) => idx !== i))}
              className="w-4 h-4 rounded-full flex items-center justify-center text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          value={text}
          placeholder={value.length ? "Add more…" : "Type and press Enter"}
          onChange={(e) => {
            if (e.target.value.endsWith(",")) commit(e.target.value);
            else setText(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit(text);
            } else if (e.key === "Backspace" && !text && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={() => text.trim() && commit(text)}
          className="flex-1 min-w-[120px] bg-transparent text-sm focus:outline-none px-1.5 py-1"
        />
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">Press Enter or comma to add.</p>
    </div>
  );
}

function ListForm<T>({
  value,
  onChange,
  render,
  empty,
  noun = "item",
  title,
}: {
  value: T[];
  onChange: (v: T[]) => void;
  render: (item: T, set: (next: T) => void) => React.ReactNode;
  empty: T;
  noun?: string;
  title?: (item: T) => string;
}) {
  const [confirming, setConfirming] = useState<number | null>(null);
  const items = value ?? [];

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    setConfirming(null);
  }

  const iconBtn =
    "w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors";

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">No {noun}s yet.</p>
      )}
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-border p-4 sm:p-5 bg-muted/30">
          <div className="flex items-center justify-between gap-3 mb-4">
            <span className="text-xs font-medium text-muted-foreground truncate">
              <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 mr-2 rounded-md bg-muted text-[10px]">
                {i + 1}
              </span>
              {title?.(item) || `New ${noun}`}
            </span>
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                aria-label="Move up"
                disabled={i === 0}
                onClick={() => move(i, -1)}
                className={iconBtn}
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label="Move down"
                disabled={i === items.length - 1}
                onClick={() => move(i, 1)}
                className={iconBtn}
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              {confirming === i ? (
                <span className="flex items-center gap-1 ml-1">
                  <button
                    type="button"
                    onClick={() => {
                      onChange(items.filter((_, idx) => idx !== i));
                      setConfirming(null);
                    }}
                    className="h-7 px-2.5 rounded-lg text-xs bg-destructive text-destructive-foreground hover:opacity-90"
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(null)}
                    className="h-7 px-2 rounded-lg text-xs text-muted-foreground hover:bg-accent"
                  >
                    Cancel
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  aria-label={`Remove ${noun}`}
                  onClick={() => setConfirming(i)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          {render(item, (next) => onChange(items.map((it, idx) => (idx === i ? next : it))))}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, structuredClone(empty)])}
        className="w-full rounded-xl border border-dashed border-border py-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground hover:border-foreground/30 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Add {noun}
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
    <div className="space-y-4">
      <div>
        <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Header profile image
        </label>
        <div className="mt-1.5 flex flex-wrap items-center gap-4 rounded-xl border border-border bg-muted/30 p-4">
          <img
            src={value.avatarUrl || "/favicon.svg"}
            alt="Header profile preview"
            className="h-16 w-16 rounded-full border border-border bg-background object-cover"
          />
          <div className="min-w-0 flex-1">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 active:scale-[0.97] transition">
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
        <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Browser tab icon
        </label>
        <div className="mt-1.5 flex flex-wrap items-center gap-4 rounded-xl border border-border bg-muted/30 p-4">
          <img
            src={value.siteIconUrl || "/favicon.svg"}
            alt="Browser tab icon preview"
            className="h-12 w-12 rounded-full border border-border bg-background object-cover"
          />
          <div className="min-w-0 flex-1">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 active:scale-[0.97] transition">
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
        <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Stat cards
        </label>
        <ListForm
          noun="stat card"
          title={(item) => item.value}
          value={value.stats ?? []}
          empty={{ value: "", label: "" }}
          onChange={(stats) => onChange({ ...value, stats })}
          render={(item, set) => (
            <div className="grid sm:grid-cols-2 gap-4">
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
    <div className="space-y-4">
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
    <div className="space-y-4">
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
