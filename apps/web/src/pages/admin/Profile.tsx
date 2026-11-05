import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ImagePlus, LoaderCircle, Trash2, Upload } from "lucide-react";
import { adminApi } from "../../services/admin";
import type { Profile } from "../../services/api";

const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

function isSupportedImage(file: File) {
  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  return file.type.startsWith("image/") && imageExtensions.has(extension);
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    adminApi.profile()
      .then(({ profile: result }) => {
        if (active) setProfile(result);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Unable to load your profile.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  function set<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((current) => current ? { ...current, [key]: value } : current);
    setNotice(null);
  }

  async function onImageSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    setNotice(null);
    if (!isSupportedImage(file)) {
      setError("Choose a PNG, JPG, WEBP, or GIF image.");
      return;
    }

    setUploading(true);
    try {
      const uploaded = await adminApi.upload(file);
      set("avatarUrl", uploaded.url);
      setNotice("Image uploaded. Save changes to update your public profile.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const savedProfile = await adminApi.updateProfile({ ...profile });
      setProfile(savedProfile);
      setNotice("Profile changes saved.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save profile changes.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-muted">Loading profile…</p>;
  if (!profile) {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p role="alert" className="mt-4 text-sm text-red-400">{error ?? "Unable to load your profile."}</p>
      </div>
    );
  }

  const inputClass = "input";

  return (
    <div className="space-y-7">
      <header className="border-b border-border pb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">Personal details</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted">Manage the information and profile photo shown across your portfolio.</p>
      </header>

      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      {notice && <p role="status" className="text-sm text-emerald-400">{notice}</p>}

      <form onSubmit={onSubmit} className="max-w-3xl space-y-7">
        <section className="card flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
          <div className="grid size-28 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-soft">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Profile photo preview" className="size-full object-cover" />
            ) : (
              <ImagePlus size={30} aria-hidden="true" className="text-muted" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">Profile photo</h2>
            <p className="mt-1 text-sm leading-6 text-muted">Use a clear portrait. PNG, JPG, WEBP, or GIF images are supported.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <input
                ref={fileInput}
                className="sr-only"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                aria-label="Choose a profile photo"
                onChange={onImageSelected}
                disabled={uploading}
              />
              <button
                type="button"
                className="btn-primary"
                onClick={() => fileInput.current?.click()}
                disabled={uploading}
              >
                {uploading ? <LoaderCircle size={16} className="animate-spin" /> : <Upload size={16} />}
                {uploading ? "Uploading…" : "Upload photo"}
              </button>
              {profile.avatarUrl && (
                <button type="button" className="btn-ghost" onClick={() => set("avatarUrl", "")} disabled={uploading}>
                  <Trash2 size={16} />
                  Remove photo
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="card space-y-5 p-5 sm:p-6">
          <div>
            <h2 className="font-semibold">About you</h2>
            <p className="mt-1 text-sm text-muted">Your name, role, and introduction.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2 text-sm font-medium">
              <span>Full name</span>
              <input className={inputClass} placeholder="Full name" required minLength={2} maxLength={120} value={profile.fullName ?? ""} onChange={(event) => set("fullName", event.target.value)} />
            </label>
            <label className="block space-y-2 text-sm font-medium">
              <span>Headline</span>
              <input className={inputClass} placeholder="e.g. Full-stack software developer" maxLength={160} value={profile.headline ?? ""} onChange={(event) => set("headline", event.target.value)} />
            </label>
          </div>
          <label className="block space-y-2 text-sm font-medium">
            <span>Bio</span>
            <textarea className={`${inputClass} resize-y`} rows={5} maxLength={5000} placeholder="Tell visitors about yourself" value={profile.bio ?? ""} onChange={(event) => set("bio", event.target.value)} />
          </label>
        </section>

        <section className="card space-y-5 p-5 sm:p-6">
          <div>
            <h2 className="font-semibold">Contact information</h2>
            <p className="mt-1 text-sm text-muted">Ways for people to reach you.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2 text-sm font-medium">
              <span>Email</span>
              <input className={inputClass} type="email" placeholder="Email" required value={profile.email ?? ""} onChange={(event) => set("email", event.target.value)} />
            </label>
            <label className="block space-y-2 text-sm font-medium">
              <span>Phone</span>
              <input className={inputClass} type="tel" placeholder="Phone" maxLength={30} value={profile.phone ?? ""} onChange={(event) => set("phone", event.target.value)} />
            </label>
            <label className="block space-y-2 text-sm font-medium">
              <span>WhatsApp</span>
              <input className={inputClass} type="tel" placeholder="WhatsApp number" maxLength={30} value={profile.whatsapp ?? ""} onChange={(event) => set("whatsapp", event.target.value)} />
            </label>
            <label className="block space-y-2 text-sm font-medium">
              <span>Location</span>
              <input className={inputClass} placeholder="City, country" maxLength={120} value={profile.location ?? ""} onChange={(event) => set("location", event.target.value)} />
            </label>
            <label className="block space-y-2 text-sm font-medium sm:col-span-2">
              <span>Resume URL</span>
              <input className={inputClass} type="url" placeholder="https://…" value={profile.resumeUrl ?? ""} onChange={(event) => set("resumeUrl", event.target.value)} />
            </label>
          </div>
        </section>

        <section className="card space-y-5 p-5 sm:p-6">
          <div>
            <h2 className="font-semibold">Purpose and values</h2>
            <p className="mt-1 text-sm text-muted">Optional statements for your About page.</p>
          </div>
          <label className="block space-y-2 text-sm font-medium">
            <span>Mission</span>
            <textarea className={`${inputClass} resize-y`} rows={3} maxLength={2000} placeholder="Mission statement" value={profile.mission ?? ""} onChange={(event) => set("mission", event.target.value)} />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            <span>Vision</span>
            <textarea className={`${inputClass} resize-y`} rows={3} maxLength={2000} placeholder="Vision statement" value={profile.vision ?? ""} onChange={(event) => set("vision", event.target.value)} />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            <span>Philosophy</span>
            <textarea className={`${inputClass} resize-y`} rows={3} maxLength={2000} placeholder="Your working philosophy" value={profile.philosophy ?? ""} onChange={(event) => set("philosophy", event.target.value)} />
          </label>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={saving || uploading} className="btn-primary">
            {saving ? <LoaderCircle size={16} className="animate-spin" /> : null}
            {saving ? "Saving…" : "Save changes"}
          </button>
          {uploading && <span className="text-sm text-muted">Wait for the photo upload to finish before saving.</span>}
        </div>
      </form>
    </div>
  );
}
