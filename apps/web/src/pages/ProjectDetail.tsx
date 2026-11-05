import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
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
  const [activeImage, setActiveImage] = useState<number | null>(null);

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

  useEffect(() => {
    if (activeImage === null || !project) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveImage(null);
      if (event.key === "ArrowRight") setActiveImage((current) => current === null ? null : (current + 1) % project!.images.length);
      if (event.key === "ArrowLeft") setActiveImage((current) => current === null ? null : (current - 1 + project!.images.length) % project!.images.length);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeImage, project]);

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-red-400">{error}</p>
        <Link to="/projects" className="mt-4 inline-block">← Back to projects</Link>
      </div>
    );
  }

  if (!project) return <div className="max-w-3xl mx-auto px-6 py-16 text-muted">Loading…</div>;

  const gallery = [...project.images].sort((left, right) => Number(right.isCover) - Number(left.isCover));
  const cover = gallery[0];

  return (
    <article className="project-detail page-container">
      <Link to="/projects" className="inline-link"><ArrowLeft size={14} /> All projects</Link>

      <header className="project-detail-header">
        <div><span className="eyebrow">{project.category?.name || "Selected project"}</span><h1>{project.title}</h1><p>{project.description}</p></div>
        <div className="project-detail-links">
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noreferrer" className="hero-primary">Live site <ArrowUpRight size={15} /></a>
          )}
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noreferrer" className="hero-secondary">Source <ArrowUpRight size={15} /></a>
          )}
        </div>
      </header>

      {cover && (
        <button type="button" className="project-detail-cover" onClick={() => setActiveImage(0)} aria-label="Open project image gallery">
          <img src={cover.url} alt={cover.alt || `${project.title} cover`} />
          {gallery.length > 1 && <span>{gallery.length} images <ArrowUpRight size={14} /></span>}
        </button>
      )}

      <div className="project-detail-columns">
        <div className="project-detail-content">
          {project.features.length > 0 && (
            <section><span className="eyebrow">What it does</span><h2>Key features</h2><ul>{project.features.map((feature, index) => <li key={index}>{feature}</li>)}</ul></section>
          )}

          {project.challenges && <section><span className="eyebrow">The problem space</span><h2>Challenges</h2><p>{project.challenges}</p></section>}
          {project.solutions && <section><span className="eyebrow">The approach</span><h2>Solutions</h2><p>{project.solutions}</p></section>}
        </div>

        <aside className="project-detail-stack"><span className="eyebrow">Built with</span><h2>Technology</h2><div className="project-detail-tech">{project.technologies.map(({ technology }, index) => <span key={`${technology.name}-${index}`}>{technology.name}</span>)}</div></aside>
      </div>

      {gallery.length > 1 && <section className="project-gallery"><div className="section-heading"><div><span className="eyebrow">Behind the build</span><h2>Project gallery</h2></div></div><div className="project-gallery-grid">{gallery.map((image, index) => <button type="button" key={`${image.url}-${index}`} onClick={() => setActiveImage(index)} aria-label={`View image ${index + 1}: ${image.alt || project.title}`}><img src={image.url} alt={image.alt || `${project.title} screenshot ${index + 1}`} loading="lazy" /></button>)}</div></section>}

      <section className="project-detail-cta"><span className="eyebrow">Have a similar challenge?</span><h2>Let's build something useful.</h2><Link to="/contact" className="hero-primary">Start a conversation <ArrowUpRight size={15} /></Link></section>

      <AnimatePresence>{activeImage !== null && gallery[activeImage] && <motion.div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label="Project image gallery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveImage(null); }}><button type="button" className="gallery-close" onClick={() => setActiveImage(null)} aria-label="Close gallery"><X size={20} /></button><button type="button" className="gallery-prev" onClick={() => setActiveImage((activeImage - 1 + gallery.length) % gallery.length)} aria-label="Previous image"><ArrowLeft size={20} /></button><motion.figure key={activeImage} initial={{ opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .98 }}><img src={gallery[activeImage].url} alt={gallery[activeImage].alt || `${project.title} image ${activeImage + 1}`} /><figcaption>{gallery[activeImage].alt || `${project.title} · ${activeImage + 1} of ${gallery.length}`}</figcaption></motion.figure><button type="button" className="gallery-next" onClick={() => setActiveImage((activeImage + 1) % gallery.length)} aria-label="Next image"><ArrowRight size={20} /></button></motion.div>}</AnimatePresence>
    </article>
  );
}
