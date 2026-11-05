import { useEffect, useState } from "react";
import { adminApi, type AdminProject } from "../../services/admin";

export default function AdminProjects() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      setProjects(await adminApi.projects());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function toggle(id: string, published: boolean) {
    try {
      await adminApi.updateProject(id, { published: !published });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }

  async function del(id: string) {
    if (!confirm("Delete this project?")) return;
    try {
      await adminApi.deleteProject(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        <a href="/admin/projects/new" className="px-3 py-1.5 rounded-md bg-accent text-bg text-sm font-medium">
          New
        </a>
      </div>

      {error && <p className="text-red-400 mb-4">{error}</p>}
      {loading && <p className="text-muted">Loading…</p>}

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface/60 text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Published</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-3 py-2">{p.title}</td>
                <td className="px-3 py-2 text-muted">{p.category?.name ?? "—"}</td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => toggle(p.id, p.published)}
                    className={`text-xs px-2 py-0.5 rounded ${p.published ? "bg-accent/20 text-accent" : "bg-border text-muted"}`}
                  >
                    {p.published ? "published" : "draft"}
                  </button>
                </td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <a href={`/admin/projects/${p.id}`} className="text-accent mr-3">Edit</a>
                  <a href={`/projects/${p.slug}`} target="_blank" rel="noreferrer" className="text-muted mr-3">View</a>
                  <button onClick={() => del(p.id)} className="text-red-400">Delete</button>
                </td>
              </tr>
            ))}
            {!loading && projects.length === 0 && (
              <tr><td colSpan={4} className="px-3 py-6 text-center text-muted">No projects yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
