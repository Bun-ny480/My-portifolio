import { useEffect, useState } from "react";
import { ArrowDownToLine, ArrowUpRight, AudioLines, FileText, Image, Mail, Newspaper, Video } from "lucide-react";
import { Link } from "react-router-dom";
import { publicApi, type MediaItem, type MediaType } from "../services/api";

const categories: { value: "ALL" | MediaType; label: string }[] = [
  { value: "ALL", label: "Everything" },
  { value: "NEWS", label: "News" },
  { value: "PROJECT", label: "Projects" },
  { value: "VIDEO", label: "Video" },
  { value: "AUDIO", label: "Audio" },
  { value: "DOCUMENT", label: "Files" },
  { value: "OTHER", label: "Other" },
];

function IconFor({ type, size = 17 }: { type: MediaType; size?: number }) {
  if (type === "NEWS") return <Newspaper size={size} />;
  if (type === "PROJECT" || type === "OTHER") return <Image size={size} />;
  if (type === "VIDEO") return <Video size={size} />;
  if (type === "AUDIO") return <AudioLines size={size} />;
  return <FileText size={size} />;
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Library() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [category, setCategory] = useState<"ALL" | MediaType>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    publicApi.media().then((data) => { if (active) setItems(data); }).catch((reason) => {
      if (active) setError(reason instanceof Error ? reason.message : "The library is unavailable.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = category === "ALL" ? items : items.filter((item) => item.type === category);

  return (
    <div className="page-container library-page">
      <header className="library-heading">
        <div><span className="eyebrow">Portfolio archive / {String(items.length).padStart(2, "0")} items</span><h1 className="display-heading">The <span>library.</span></h1><p>A growing collection of updates, project resources, recordings, and files.</p></div>
        <Link to="/contact" className="library-contact"><Mail size={16} /> Ask about a resource <ArrowUpRight size={15} /></Link>
      </header>

      <div className="library-toolbar" aria-label="Filter library items">
        {categories.map((item) => <button key={item.value} type="button" aria-pressed={category === item.value} onClick={() => setCategory(item.value)}>{item.label}</button>)}
      </div>

      {error && <p role="alert" className="empty-state">{error}</p>}
      {loading ? <p className="empty-state">Loading the library...</p> : !error && filtered.length === 0 ? <p className="empty-state">No published items in this collection yet.</p> : (
        <div className="library-grid">
          {filtered.map((item) => <article key={item.id} className="library-item">
            <div className="library-item-top"><span className="library-type"><IconFor type={item.type} size={15} />{item.type}</span><time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</time></div>
            {item.mimeType.startsWith("image/") && <a className="library-preview library-image-preview" href={item.url} target="_blank" rel="noreferrer"><img src={item.url} alt={item.title} loading="lazy" /></a>}
            {item.mimeType.startsWith("video/") && <video className="library-preview" controls preload="metadata"><source src={item.url} type={item.mimeType} />Your browser does not support video playback.</video>}
            {item.mimeType.startsWith("audio/") && <div className="library-audio"><AudioLines size={28} /><audio controls preload="metadata"><source src={item.url} type={item.mimeType} />Your browser does not support audio playback.</audio></div>}
            <div className="library-item-copy"><h2>{item.title}</h2><p>{item.description || item.originalName}</p></div>
            <a className="library-download" href={item.url} target="_blank" rel="noreferrer" download={item.originalName}><span>{item.type === "VIDEO" || item.type === "AUDIO" ? "Open media" : "Open file"}</span><ArrowDownToLine size={16} /></a>
            <span className="library-file-meta">{item.originalName} <i /> {formatSize(item.size)}</span>
          </article>)}
        </div>
      )}

      <aside className="library-contact-band"><span className="eyebrow">Need something specific?</span><h2>Let's find the right file.</h2><p>Questions, resource requests, and project inquiries are welcome.</p><Link to="/contact" className="hero-primary">Contact Dieu Aime <ArrowUpRight size={15} /></Link></aside>
    </div>
  );
}