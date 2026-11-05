import { useEffect, useState, type FormEvent } from "react";
import { AudioLines, ExternalLink, FileText, Image, Newspaper, Trash2, Upload, Video } from "lucide-react";
import { adminApi } from "../../services/admin";
import type { MediaItem, MediaType } from "../../services/api";

const types: { value: MediaType; label: string }[] = [
  { value: "NEWS", label: "News" },
  { value: "PROJECT", label: "Project" },
  { value: "VIDEO", label: "Video" },
  { value: "AUDIO", label: "Audio" },
  { value: "DOCUMENT", label: "File / document" },
  { value: "OTHER", label: "Other" },
];

function typeIcon(type: MediaType) {
  if (type === "NEWS") return Newspaper;
  if (type === "PROJECT" || type === "OTHER") return Image;
  if (type === "VIDEO") return Video;
  if (type === "AUDIO") return AudioLines;
  return FileText;
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminMedia() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<MediaType>("DOCUMENT");
  const [published, setPublished] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    try {
      setItems(await adminApi.media());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load uploads");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;
    const form = event.currentTarget;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await adminApi.uploadMedia(file, { title, description, type, published });
      setFile(null);
      setTitle("");
      setDescription("");
      setPublished(false);
      form.reset();
      setNotice("Upload added to the library.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Upload failed");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(item: MediaItem) {
    setError(null);
    try {
      const updated = await adminApi.updateMedia(item.id, { published: !item.published });
      setItems((current) => current.map((entry) => entry.id === item.id ? updated : entry));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update item");
    }
  }

  async function remove(item: MediaItem) {
    if (!window.confirm(`Delete "${item.title}" and its uploaded file?`)) return;
    try {
      await adminApi.deleteMedia(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to delete item");
    }
  }

  const visibleItems = filter === "ALL" ? items : items.filter((item) => item.type === filter);
  const inputClass = "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg placeholder:text-muted focus:border-accent focus:outline-none";

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Content manager</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Media library</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">Upload and publish news, project resources, video, audio, and documents for visitors.</p>
        </div>
        <a href="/library" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-accent hover:underline">View public library <ExternalLink size={14} /></a>
      </header>

      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      {notice && <p role="status" className="text-sm text-emerald-400">{notice}</p>}

      <form onSubmit={submit} className="grid gap-4 border-b border-border pb-8 md:grid-cols-[minmax(0,1.3fr)_minmax(240px,.7fr)]">
        <div className="space-y-4">
          <label className="block space-y-2 text-sm font-medium">
            <span>Choose a file</span>
            <input className={inputClass} type="file" required accept="image/*,video/mp4,video/webm,audio/*,.pdf,.txt,.csv,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip" onChange={(event) => {
              const selected = event.target.files?.[0] ?? null;
              setFile(selected);
              if (selected && !title) setTitle(selected.name.replace(/\.[^.]+$/, ""));
            }} />
            <span className="block text-xs font-normal text-muted">Images, MP4/WebM, common audio, documents, and ZIP. File size is limited by the server.</span>
          </label>
          <label className="block space-y-2 text-sm font-medium">Title<input className={inputClass} value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} required /></label>
          <label className="block space-y-2 text-sm font-medium">Description <span className="font-normal text-muted">(optional)</span><textarea className={inputClass} value={description} onChange={(event) => setDescription(event.target.value)} maxLength={1000} rows={3} /></label>
        </div>
        <div className="flex flex-col gap-4">
          <label className="block space-y-2 text-sm font-medium">Type<select className={inputClass} value={type} onChange={(event) => setType(event.target.value as MediaType)}>{types.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          <label className="flex min-h-11 items-center gap-3 text-sm"><input className="size-4 accent-cyan-400" type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} /><span>Publish immediately</span></label>
          <button type="submit" disabled={!file || saving} className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"><Upload size={16} />{saving ? "Uploading..." : "Upload to library"}</button>
        </div>
      </form>

      <section aria-labelledby="uploads-heading">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div><h2 id="uploads-heading" className="text-lg font-semibold">Uploads</h2><p className="mt-1 text-xs text-muted">{items.length} {items.length === 1 ? "item" : "items"}</p></div>
          <label className="flex items-center gap-2 text-xs text-muted">Filter<select className="rounded-md border border-border bg-surface px-2 py-2 text-fg" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="ALL">All types</option>{types.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        </div>
        {loading ? <p className="py-10 text-center text-sm text-muted">Loading uploads...</p> : visibleItems.length === 0 ? <p className="border-y border-border py-12 text-center text-sm text-muted">No uploads here yet.</p> : (
          <ul className="divide-y divide-border border-y border-border">
            {visibleItems.map((item) => {
              const Icon = typeIcon(item.type);
              return <li key={item.id} className="grid gap-3 py-4 sm:grid-cols-[40px_minmax(0,1fr)_auto] sm:items-center">
                <span className="grid size-10 place-items-center rounded-md border border-border bg-surface text-accent"><Icon size={18} /></span>
                <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-sm font-medium">{item.title}</h3><span className="text-[10px] uppercase tracking-wide text-muted">{item.type}</span></div><p className="mt-1 truncate text-xs text-muted">{item.originalName} · {formatSize(item.size)} · {new Date(item.createdAt).toLocaleDateString()}</p></div>
                <div className="flex items-center gap-3 sm:justify-end"><button type="button" onClick={() => void togglePublished(item)} className={`min-h-9 rounded-md border px-3 text-xs ${item.published ? "border-emerald-500/30 text-emerald-400" : "border-border text-muted"}`}>{item.published ? "Published" : "Draft"}</button><a className="grid size-9 place-items-center rounded-md border border-border text-muted hover:text-fg" href={item.url} target="_blank" rel="noreferrer" aria-label={`Open ${item.title}`} title="Open upload"><ExternalLink size={14} /></a><button type="button" onClick={() => void remove(item)} className="grid size-9 place-items-center rounded-md border border-border text-muted hover:border-red-400/50 hover:text-red-400" aria-label={`Delete ${item.title}`} title="Delete upload"><Trash2 size={15} /></button></div>
              </li>;
            })}
          </ul>
        )}
      </section>
    </div>
  );
}