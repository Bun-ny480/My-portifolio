import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { publicApi, type ProjectCard } from "../services/api";

type ProjectFull = ProjectCard & {
  features: string[];
  challenges: string | null;
  solutions: string | null;
  githubUrl: string | null;
  liveUrl: string | null;
};

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<ProjectFull | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        setProject(await publicApi.project(slug));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    })();
  }, [slug]);

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-red-400">{error}</p>
        <Link to="/projects" className="mt-4 inline-block">← Back to projects</Link>
      </div>
    );
  }

  if (!project) return <div className="max-w-3xl mx-auto px-6 py-16 text-muted">Loading…</div>;

  const cover = project.images.find((i) => i.isCover);

  return (
    <article className="max-w-3xl mx-auto px-6 py-16">
      <Link to="/projects" className="text-sm text-muted">← All projects</Link>

      <header className="mt-6">
        <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
        {project.category && (
          <p className="mt-2 text-sm text-muted">{project.category.name}</p>
        )}
        <div className="mt-4 flex gap-3 flex-wrap">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-md bg-accent text-bg font-medium hover:opacity-90"
            >
              Live site
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-md border border-border hover:bg-surface"
            >
              Source
            </a>
          )}
        </div>
      </header>

      {cover && (
        <img
          src={cover.url}
          alt={cover.alt}
          className="mt-8 rounded-lg border border-border w-full"
        />
      )}

      <p className="mt-8 leading-relaxed whitespace-pre-wrap">{project.description}</p>

      {project.features.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-3">Features</h2>
          <ul className="list-disc list-inside space-y-1 text-muted">
            {project.features.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </section>
      )}

      {project.challenges && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-3">Challenges</h2>
          <p className="text-muted leading-relaxed whitespace-pre-wrap">{project.challenges}</p>
        </section>
      )}

      {project.solutions && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-3">Solutions</h2>
          <p className="text-muted leading-relaxed whitespace-pre-wrap">{project.solutions}</p>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-3">Tech stack</h2>
        <div className="flex flex-wrap gap-2">
          {project.technologies.map((t, i) => (
            <span key={i} className="text-sm px-3 py-1 rounded bg-surface border border-border">
              {t.technology.name}
            </span>
          ))}
        </div>
      </section>
    </article>
  );
}
