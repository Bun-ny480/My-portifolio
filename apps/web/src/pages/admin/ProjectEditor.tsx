import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Check, ImagePlus, LoaderCircle, Upload } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { adminApi, type AdminProject } from "../../services/admin";

type ProjectCategory = { id: string; name: string; slug: string };
type ProjectImage = AdminProject["images"][number];
const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

function isSupportedImage(file: File) {
  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  return imageExtensions.has(extension);
}

export default function ProjectEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(false);
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [features, setFeatures] = useState("");
  const [challenges, setChallenges] = useState("");
  const [solutions, setSolutions] = useState("");
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    adminApi.projectCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const p = await adminApi.project(id);
        setTitle(p.title);
        setSlug(p.slug);
        setDescription(p.description);
        setCategoryId(p.category?.slug ? (categories.find((c) => c.slug === p.category!.slug)?.id ?? "") : "");
        setFeatured(p.featured);
        setPublished(p.published);
        setGithubUrl(p.githubUrl ?? "");
        setLiveUrl(p.liveUrl ?? "");
        setFeatures(p.features.join("\n"));
        setChallenges(p.challenges ?? "");
        setSolutions(p.solutions ?? "");
        setImages(p.images);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    })();
  }, [id, categories]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const body = {
      title,
      slug,
      description,
      categoryId,
      featured,
      published,
      githubUrl,
      liveUrl,
      features: features.split("\n").map((s) => s.trim()).filter(Boolean),
      challenges,
      solutions,
      technologyIds: [],
    };
    try {
      if (isNew) {
        const project = await adminApi.createProject(body);
        navigate(`/admin/projects/${project.id}`, { replace: true });
      } else {
        await adminApi.updateProject(id!, body);
        navigate("/admin/projects");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function onImageSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !id) return;

    setError(null);
    setNotice(null);
    if (!isSupportedImage(file)) {
      setError("Choose a PNG, JPG, WEBP, or GIF image.");
      return;
    }

    setUploadingImage(true);
    try {
      const uploaded = await adminApi.upload(file);
      const image = await adminApi.addProjectImage(id, {
        url: uploaded.url,
        alt: `${title || "Project"} banner`,
        order: images.length,
        isCover: true,
      });
      setImages((current) => [...current.map((item) => ({ ...item, isCover: false })), image]);
      setNotice("Project banner updated.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to upload project banner.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function setCover(image: ProjectImage) {
    if (!id || image.isCover) return;
    setError(null);
    setNotice(null);
    try {
      const updatedImage = await adminApi.setProjectImageCover(id, image.id);
      setImages((current) => current.map((item) => ({
        ...item,
        isCover: item.id === updatedImage.id,
      })));
      setNotice("Project banner updated.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update project banner.");
    }
  }

  const inputClass =
    "w-full px-3 py-2 rounded-md bg-surface border border-border focus:outline-none focus:border-accent";
  const coverImage = images.find((image) => image.isCover) ?? images[0];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-6">
        {isNew ? "New project" : "Edit project"}
      </h1>

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
      {notice && <p role="status" className="mb-4 text-sm text-emerald-400">{notice}</p>}

      <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
        <section className="space-y-4 rounded-lg border border-border p-4">
          <div>
            <h2 className="font-semibold">Project banner</h2>
            <p className="mt-1 text-sm text-muted">
              Choose the image shown on project cards and at the top of the project page. You can change it at any time.
            </p>
          </div>
          {coverImage ? (
            <img src={coverImage.url} alt={coverImage.alt || `${title || "Project"} banner preview`} className="aspect-video w-full rounded-md border border-border object-cover" />
          ) : (
            <div className="grid aspect-video w-full place-items-center rounded-md border border-dashed border-border bg-surface text-muted">
              <div className="flex items-center gap-2 text-sm"><ImagePlus size={18} /> No banner image yet</div>
            </div>
          )}
          {id ? (
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={imageInput}
                className="sr-only"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                aria-label="Choose a project banner image"
                onChange={onImageSelected}
                disabled={uploadingImage}
              />
              <button type="button" className="px-4 py-2 rounded-md bg-accent text-bg font-medium disabled:opacity-50" onClick={() => imageInput.current?.click()} disabled={uploadingImage}>
                {uploadingImage ? <LoaderCircle size={16} className="mr-2 inline animate-spin" /> : <Upload size={16} className="mr-2 inline" />}
                {uploadingImage ? "Uploading…" : coverImage ? "Replace banner" : "Upload banner"}
              </button>
              <span className="text-xs text-muted">PNG, JPG, WEBP, or GIF</span>
            </div>
          ) : (
            <p className="text-sm text-muted">Save the project first, then upload or change its banner.</p>
          )}

          {images.length > 1 && (
            <div>
              <h3 className="mb-2 text-sm font-medium">Choose from project images</h3>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {images.map((image) => (
                  <li key={image.id} className="space-y-2">
                    <img src={image.url} alt={image.alt} className="aspect-video w-full rounded-md border border-border object-cover" />
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs text-accent disabled:cursor-default disabled:text-muted"
                      onClick={() => void setCover(image)}
                      disabled={image.isCover}
                    >
                      {image.isCover ? <><Check size={14} /> Current banner</> : "Set as banner"}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <input className={inputClass} placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <input className={inputClass} placeholder="Slug (e.g. my-project)" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        <textarea className={inputClass} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} />
        <select className={inputClass} value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
          <option value="">— choose category —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input className={inputClass} placeholder="GitHub URL" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} />
        <input className={inputClass} placeholder="Live URL" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} />
        <textarea className={inputClass} placeholder="Features (one per line)" value={features} onChange={(e) => setFeatures(e.target.value)} rows={4} />
        <textarea className={inputClass} placeholder="Challenges" value={challenges} onChange={(e) => setChallenges(e.target.value)} rows={3} />
        <textarea className={inputClass} placeholder="Solutions" value={solutions} onChange={(e) => setSolutions(e.target.value)} rows={3} />

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            Published
          </label>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving || uploadingImage} className="px-4 py-2 rounded-md bg-accent text-bg font-medium disabled:opacity-50">
            {saving ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={() => navigate("/admin/projects")} className="px-4 py-2 rounded-md border border-border">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
