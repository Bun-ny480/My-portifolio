import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { publicApi, type Profile, type ProjectCard } from "../services/api";

export default function Home() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<ProjectCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [p, projects] = await Promise.all([
          publicApi.profile(),
          publicApi.projects({ limit: 6 }),
        ]);
        if (cancelled) return;
        setProfile(p.profile);
        setProjects(projects);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-24">
        <p className="text-muted">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-24">
        <p className="text-red-400">Failed to load: {error}</p>
        <p className="text-muted mt-2">Is the API running on http://localhost:4000?</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <section className="mb-20">
        <p className="text-sm text-muted mb-2">{profile?.location ?? "Rwanda"}</p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          {profile?.fullName ?? "Niyonizeye Dieu Aime"}
        </h1>
        <p className="mt-3 text-xl text-muted">
          {profile?.headline ?? "Full-Stack Software Developer"}
        </p>
        {profile?.bio && (
          <p className="mt-6 max-w-2xl leading-relaxed">{profile.bio}</p>
        )}
        <div className="mt-8 flex gap-4">
          <Link
            to="/projects"
            className="px-5 py-2 rounded-md bg-accent text-bg font-medium hover:opacity-90"
          >
            See projects
          </Link>
          {profile?.email && (
            <a
              href={`mailto:${profile.email}`}
              className="px-5 py-2 rounded-md border border-border hover:bg-surface"
            >
              Get in touch
            </a>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl font-semibold">Recent work</h2>
          <Link to="/projects" className="text-sm text-muted">All →</Link>
        </div>

        {projects.length === 0 ? (
          <p className="text-muted">No published projects yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {projects.map((p) => (
              <Link
                key={p.id}
                to={`/projects/${p.slug}`}
                className="block rounded-lg border border-border bg-surface p-5 hover:border-accent transition"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-medium">{p.title}</h3>
                  {p.featured && <span className="text-xs text-accent">★ featured</span>}
                </div>
                <p className="mt-2 text-sm text-muted line-clamp-3">{p.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {p.technologies.slice(0, 4).map((t, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 rounded bg-border text-muted"
                    >
                      {t.technology.name}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
