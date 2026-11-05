import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Search, SlidersHorizontal } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { publicApi, type ProjectCard } from "../services/api";

export default function Projects() {
  const [projects, setProjects] = useState<ProjectCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const technology = searchParams.get("technology") ?? "";
  const sort = searchParams.get("sort") ?? "newest";
  const featuredOnly = searchParams.get("featured") === "true";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const rows = await publicApi.projects({ limit: 100 });
        if (!cancelled) setProjects(rows);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const categories = useMemo(() => Array.from(new Map(projects.flatMap((project) => project.category ? [[project.category.slug, project.category.name] as const] : [])).entries()), [projects]);
  const technologies = useMemo(() => Array.from(new Set(projects.flatMap((project) => project.technologies.map(({ technology: item }) => item.name))).values()).sort((left, right) => left.localeCompare(right)), [projects]);
  const visibleProjects = useMemo(() => {
    const normalizedQuery = q.trim().toLowerCase();
    const filtered = projects.filter((project) => {
      const matchesQuery = !normalizedQuery || `${project.title} ${project.description} ${project.technologies.map(({ technology: item }) => item.name).join(" ")}`.toLowerCase().includes(normalizedQuery);
      const matchesCategory = !category || project.category?.slug === category;
      const matchesTechnology = !technology || project.technologies.some(({ technology: item }) => item.name === technology);
      return matchesQuery && matchesCategory && matchesTechnology && (!featuredOnly || project.featured);
    });
    return filtered.sort((left, right) => {
      if (sort === "alphabetical") return left.title.localeCompare(right.title);
      if (sort === "featured") return Number(right.featured) - Number(left.featured) || left.title.localeCompare(right.title);
      return (right.completedAt ? Date.parse(right.completedAt) : 0) - (left.completedAt ? Date.parse(left.completedAt) : 0);
    });
  }, [projects, q, category, technology, sort, featuredOnly]);

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  }

  return (
    <div className="projects-page page-container">
      <header className="projects-heading">
        <div><span className="eyebrow">A selection of recent work</span><h1 className="display-heading">Projects<span className="gradient-text">.</span></h1><p>Products and systems built around real problems, with care in the details.</p></div>
        <span className="projects-count">{loading ? "Loading" : `${visibleProjects.length} projects`}</span>
      </header>

      <section className="project-filters" aria-label="Filter projects">
        <label className="project-search"><Search size={16} /><input value={q} onChange={(event) => updateFilter("q", event.target.value)} placeholder="Search projects or technologies" aria-label="Search projects" /></label>
        <label className="filter-select"><span>Category</span><select value={category} onChange={(event) => updateFilter("category", event.target.value)}><option value="">All categories</option>{categories.map(([slug, name]) => <option key={slug} value={slug}>{name}</option>)}</select></label>
        <label className="filter-select"><span>Technology</span><select value={technology} onChange={(event) => updateFilter("technology", event.target.value)}><option value="">All technologies</option>{technologies.map((name) => <option key={name} value={name}>{name}</option>)}</select></label>
        <label className="filter-select"><span>Sort by</span><select value={sort} onChange={(event) => updateFilter("sort", event.target.value)}><option value="newest">Newest</option><option value="alphabetical">A to Z</option><option value="featured">Featured first</option></select></label>
        <label className="featured-filter"><input type="checkbox" checked={featuredOnly} onChange={(event) => updateFilter("featured", event.target.checked ? "true" : "")} /><span><SlidersHorizontal size={14} /> Featured</span></label>
      </section>

      <div className="projects-results">
        {error && <p className="text-red-400 mb-6" role="alert">{error}</p>}
        {loading && <div className="empty-state" role="status">Loading published projects…</div>}
        {!loading && visibleProjects.length === 0 && <div className="empty-state">No projects match these filters. <button type="button" className="inline-link" onClick={() => setSearchParams({}, { replace: true })}>Clear filters</button></div>}
        {!loading && visibleProjects.length > 0 && <div className="project-grid">{visibleProjects.map((project, index) => {
          const cover = project.images.find((image) => image.isCover) || project.images[0];
          return <Link key={project.id} to={`/projects/${project.slug}`} className={`project-card${index === 0 ? " project-card-featured" : ""}`}>
            <div className="project-visual">{cover ? <img src={cover.url} alt={cover.alt || `${project.title} preview`} loading="lazy" /> : <div className="project-visual-placeholder"><span><ArrowUpRight size={25} /></span></div>}<span className="project-visual-tag">{project.featured ? "FEATURED PROJECT" : project.category?.name || "PROJECT"}</span></div>
            <div className="project-card-body"><div className="project-card-heading"><h2>{project.title}</h2><ArrowUpRight size={18} /></div><p>{project.description}</p><div className="project-card-footer"><div className="project-tech-list">{project.technologies.slice(0, 4).map(({ technology: item }) => <span key={item.name}>{item.name}</span>)}</div><span className="inline-link">View details <ArrowUpRight size={14} /></span></div></div>
          </Link>;
        })}</div>}
      </div>
    </div>
  );
}
