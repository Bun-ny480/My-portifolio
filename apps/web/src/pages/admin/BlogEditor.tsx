import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminApi } from "../../services/admin";

export default function BlogEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.blogCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const p = await adminApi.blogPost(id);
        setTitle(p.title);
        setSlug(p.slug);
        setExcerpt(p.excerpt);
        setContent(p.content);
        setPublished(p.published);
        setCategoryId(p.category?.slug ? (categories.find((c) => c.slug === p.category!.slug)?.id ?? "") : "");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    })();
  }, [id, categories]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const body = { title, slug, excerpt, content, published, categoryId: categoryId || undefined, tagIds: [] };
    try {
      if (isNew) await adminApi.createBlogPost(body);
      else await adminApi.updateBlogPost(id!, body);
      navigate("/admin/blog");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full px-3 py-2 rounded-md bg-surface border border-border focus:outline-none focus:border-accent";

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-6">{isNew ? "New post" : "Edit post"}</h1>
      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
        <input className={inputClass} placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <input className={inputClass} placeholder="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        <textarea className={inputClass} placeholder="Excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} required rows={2} />
        <textarea className={inputClass} placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} required rows={12} />
        <select className={inputClass} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">— no category —</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          Published
        </label>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="px-4 py-2 rounded-md bg-accent text-bg font-medium disabled:opacity-50">
            {saving ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={() => navigate("/admin/blog")} className="px-4 py-2 rounded-md border border-border">Cancel</button>
        </div>
      </form>
    </div>
  );
}
