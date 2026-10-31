import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { publicApi, type ProjectCard } from "../services/api";

export default function Projects() {
  const [projects, setProjects] = useState<ProjectCard[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const rows = await publicApi.projects({ limit: 50, q: q || undefined });
        if (!cancelled) setProjects(rows);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [q]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="mt-2 text-muted">Things I've built and shipped.</p>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search…"
          className="w-full sm:w-64 px-3 py-2 rounded-md bg-surface border border-border focus:outline-none focus:border-accent"
        />
      </div>

      {error && <p className="text-red-400 mb-6">{error}</p>}
      {loading && <p className="text-muted">Loading…</p>}

      {!loading && projects.length === 0 && (
        <p className="text-muted">No projects match.</p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {projects.map((p) => (
          <Link
            key={p.id}
            to={`/projects/${p.slug}`}
            className="block rounded-lg border border-border bg-surface p-5 hover:border-accent transition"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-medium">{p.title}</h3>
              {p.featured && <span className="text-xs text-accent">★</span>}
            </div>
            <p className="mt-2 text-sm text-muted line-clamp-3">{p.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {p.technologies.slice(0, 4).map((t, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded bg-border text-muted">
                  {t.technology.name}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
