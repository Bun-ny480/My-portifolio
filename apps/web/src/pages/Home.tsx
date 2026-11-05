import { motion } from "framer-motion";
import { ArrowDownToLine, ArrowRight, ArrowUpRight, AudioLines, Braces, Code2, Compass, Download, ExternalLink, FileText, Image, Layers3, Mail, MapPin, Newspaper, Plug, Sparkles, Video } from "lucide-react";
import { FaEnvelope, FaFacebookF, FaGithub, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { publicApi, type BlogPostCard, type MediaItem, type MediaType, type Profile, type ProjectCard, type Service, type SkillCategory, type Social } from "../services/api";

const DEFAULT_AVATAR_URL = "/profile.png";
const DEFAULT_SOCIALS = [
  { id: "github-default", label: "GitHub", url: "https://github.com/Bun-ny480", icon: "github" },
  { id: "linkedin-default", label: "LinkedIn", url: "https://www.linkedin.com/feed/", icon: "linkedin" },
  { id: "instagram-default", label: "Instagram", url: "https://www.instagram.com/__b.a.v.a.r.d__/", icon: "instagram" },
  { id: "facebook-default", label: "Facebook", url: "https://www.facebook.com", icon: "facebook" },
  { id: "email-default", label: "Gmail", url: "https://mail.google.com/mail/?view=cm&fs=1&to=dieuaime480@gmail.com", icon: "mail" },
] as const;
const reveal = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } };
const iconForService = (icon: string) => icon === "plug" ? Plug : icon === "compass" ? Compass : Code2;
const iconForMedia = (type: MediaType) => type === "NEWS" ? Newspaper : type === "VIDEO" ? Video : type === "AUDIO" ? AudioLines : type === "DOCUMENT" ? FileText : Image;
const labelForMedia = (type: MediaType) => type === "DOCUMENT" ? "Resource" : type.charAt(0) + type.slice(1).toLowerCase();

export default function Home() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [socials, setSocials] = useState<Social[]>([]);
  const [projects, setProjects] = useState<ProjectCard[]>([]);
  const [skills, setSkills] = useState<SkillCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [posts, setPosts] = useState<BlogPostCard[]>([]);
  const [libraryItems, setLibraryItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      publicApi.profile().catch(() => ({ profile: null, socials: [] })),
      publicApi.projects({ limit: 50 }),
      publicApi.skills().catch(() => []),
      publicApi.services().catch(() => []),
      publicApi.blog({ limit: 4 }).catch(() => []),
      publicApi.media().catch(() => []),
    ]).then(([profileData, projectData, skillData, serviceData, postData, mediaData]) => {
      if (!active) return;
      setProfile(profileData.profile);
      setSocials(profileData.socials);
      setProjects(projectData);
      setSkills(skillData);
      setServices(serviceData);
      setPosts(postData);
      setLibraryItems(mediaData.slice(0, 3));
    }).catch((caught) => {
      if (active) setError(caught instanceof Error ? caught.message : "Unable to load portfolio content");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const technologyCount = useMemo(() => new Set([
    ...projects.flatMap((project) => project.technologies.map(({ technology }) => technology.name)),
    ...skills.flatMap((category) => category.skills.map((skill) => skill.name)),
  ]).size, [projects, skills]);
  const featuredProjects = projects.filter((project) => project.featured);
  const visibleProjects = (featuredProjects.length ? featuredProjects : projects).slice(0, 4);
  const headlineName = profile?.fullName || "Dieu Aime";
  const initials = headlineName.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const avatarUrl = profile?.avatarUrl || DEFAULT_AVATAR_URL;
  const visibleSocials = socials.length ? socials : DEFAULT_SOCIALS;

  return (
    <>
      <section className="hero-section" aria-labelledby="hero-title">
        <motion.div className="hero-copy" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: .09 } } }}>
          <motion.div variants={reveal}><span className="status-pill"><i className="status-dot" /> Full-stack engineering · Rwanda</span></motion.div>
          <motion.h1 id="hero-title" variants={reveal}>Building digital<br /><span className="gradient-text">experiences</span> that<br />make an impact.</motion.h1>
          <motion.p variants={reveal}>{profile?.bio || "I build modern web applications, reliable backend systems, and thoughtful digital experiences from idea to launch."}</motion.p>
          {error && <p className="mt-4 text-sm text-red-400" role="status">Some portfolio content could not be loaded.</p>}
          <motion.div className="hero-actions" variants={reveal}>
            <Link to="/projects" className="hero-primary">Explore my work <ArrowUpRight size={16} /></Link>
            <Link to="/contact" className="hero-secondary">Let's work together <ArrowRight size={15} /></Link>
            {profile?.resumeUrl && <a className="hero-secondary" href={profile.resumeUrl} target="_blank" rel="noreferrer" download><Download size={15} /> Download CV</a>}
          </motion.div>
          <motion.div className="tech-line" variants={reveal}>
            <span className="tech-line-label">Currently building with</span>
            {Array.from(new Set(skills.flatMap((category) => category.skills.map((skill) => skill.name)))).slice(0, 6).map((technology) => <span key={technology}>{technology}</span>)}
            {!skills.length && Array.from(new Set(projects.flatMap((project) => project.technologies.map(({ technology }) => technology.name)))).slice(0, 6).map((technology) => <span key={technology}>{technology}</span>)}
          </motion.div>
        </motion.div>

        <motion.aside className="identity-card" aria-label="Developer profile" initial={{ opacity: 0, y: 22, rotate: 3 }} animate={{ opacity: 1, y: 0, rotate: 1.2 }} transition={{ duration: .65, delay: .12 }}>
          <div className="identity-topline"><span>PERSONAL PROFILE</span><span>01 / 01</span></div>
          <div className="identity-avatar">
            <span className="avatar-index">KIGALI · RWANDA</span>
            {avatarUrl ? <img src={avatarUrl} alt={headlineName} /> : <span className="monogram">{initials}<span>.</span></span>}
            <span className="avatar-orbit"><i className="status-dot" /> Open to project conversations</span>
          </div>
          <div className="identity-details">
            <div><h2>{headlineName}</h2><p>{profile?.headline || "Full-Stack Software Developer"}</p></div>
            <span className="identity-location"><MapPin size={13} />{profile?.location || "Rwanda"}</span>
          </div>
          <div className="identity-socials">
            {visibleSocials.map((social) => <a key={social.id} href={social.url} aria-label={social.label} title={social.label} target={social.url.startsWith("http") ? "_blank" : undefined} rel={social.url.startsWith("http") ? "noreferrer" : undefined}><SocialGlyph icon={social.icon} /></a>)}
          </div>
          <div className="identity-float"><Sparkles size={14} /><span>Focus</span><strong>Build / Learn / Ship</strong></div>
        </motion.aside>
      </section>

      <motion.section className="stats-strip" aria-label="Portfolio at a glance" initial="hidden" whileInView="visible" viewport={{ once: true, amount: .5 }} variants={{ visible: { transition: { staggerChildren: .1 } } }}>
        <Stat value={loading ? "—" : String(projects.length).padStart(2, "0")} label="Published projects" />
        <Stat value={loading ? "—" : String(technologyCount).padStart(2, "0")} label="Tools in practice" />
        <Stat value={loading ? "—" : String(skills.length).padStart(2, "0")} label="Expertise areas" />
      </motion.section>

      <section className="section-block" id="projects">
        <SectionHeading eyebrow="Selected work" title="Built to solve real problems." description="A closer look at products, systems, and tools shaped around thoughtful engineering." action={<Link to="/projects" className="inline-link">All projects <ArrowUpRight size={15} /></Link>} />
        {loading ? <div className="project-grid">{[1, 2].map((item) => <div key={item} className="project-card animate-pulse"><div className="project-visual" /><div className="project-card-body"><div className="h-5 w-1/2 rounded bg-soft" /><div className="mt-4 h-10 rounded bg-soft" /></div></div>)}</div> : visibleProjects.length ? <div className="project-grid">{visibleProjects.map((project, index) => <ProjectTile key={project.id} project={project} index={index} />)}</div> : <div className="empty-state">Projects will appear here when published from the portfolio dashboard.</div>}
      </section>

      {libraryItems.length > 0 && (
        <section className="section-block" id="library">
          <SectionHeading
            eyebrow="Fresh from the library"
            title="Useful things, worth a look."
            description="A rotating selection of project resources, updates, and media. Open an item or browse the full collection."
            action={<Link to="/library" className="inline-link">Explore the library <ArrowUpRight size={15} /></Link>}
          />
          <div className={`home-library-grid${libraryItems.length === 3 ? " home-library-grid-featured" : ""}`}>
            {libraryItems.map((item, index) => {
              const Icon = iconForMedia(item.type);
              const isImage = item.mimeType.startsWith("image/");
              return (
                <motion.a
                  key={item.id}
                  className={`home-library-card${index === 0 && libraryItems.length === 3 ? " home-library-featured" : ""}`}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: .2 }}
                  variants={reveal}
                  transition={{ delay: index * .07 }}
                  aria-label={`Open ${item.title} from the library`}
                >
                  <div className={`home-library-art${isImage ? " home-library-art-image" : ""}`}>
                    {isImage ? <img src={item.url} alt="" loading="lazy" /> : <span className="home-library-art-icon"><Icon size={index === 0 ? 38 : 28} strokeWidth={1.5} /></span>}
                    <span className="home-library-type"><Icon size={13} />{labelForMedia(item.type)}</span>
                    <span className="home-library-open"><ArrowUpRight size={16} /></span>
                  </div>
                  <div className="home-library-copy">
                    <span>{new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</span>
                    <h3>{item.title}</h3>
                    <p>{item.description || item.originalName}</p>
                    <span className="home-library-download">Open item <ArrowDownToLine size={14} /></span>
                  </div>
                </motion.a>
              );
            })}
          </div>
        </section>
      )}

      <section className="section-block" id="skills">
        <SectionHeading eyebrow="Technology & craft" title="A versatile toolkit." description="Tools selected for the problem at hand, organized from the skills currently shared in the portfolio." action={<Link to="/about" className="inline-link">How I work <ArrowUpRight size={15} /></Link>} />
        {skills.length ? <div className="skills-panel">{skills.map((category) => <div className="skill-group" key={category.id}><h3>{category.name}</h3><div className="skill-group-items">{category.skills.map((skill) => <span className="skill-chip" key={skill.id} title={skill.description || undefined}><i />{skill.name}</span>)}</div></div>)}</div> : <div className="empty-state">Skills are being updated. Check back soon.</div>}
      </section>

      <section className="section-block" id="services">
        <SectionHeading eyebrow="Ways to collaborate" title="Good ideas deserve good engineering." description="From the first architecture sketch to a production-ready release, here are the services currently available." action={<Link to="/services" className="inline-link">Explore services <ArrowUpRight size={15} /></Link>} />
        {services.length ? <div className="service-grid">{services.slice(0, 3).map((service) => {
          const Icon = iconForService(service.icon);
          return <motion.article className="service-card" key={service.id} variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: .25 }}>
            <div className="service-icon"><Icon size={20} /></div><h3>{service.title}</h3><p>{service.description}</p>
            <Link to={`/contact?service=${encodeURIComponent(service.title)}`} className="inline-link">Discuss this service <ArrowRight size={14} /></Link>
          </motion.article>;
        })}</div> : <div className="empty-state">Services are being updated.</div>}
      </section>

      <section className="section-block" id="about">
        <div className="about-band">
          <div className="about-mark" aria-hidden="true"><span>{initials}<b className="gradient-text">.</b></span></div>
          <div className="about-copy"><span className="eyebrow">A little about me</span><h2>Engineering with clarity.<br /><span className="gradient-text">Designing with empathy.</span></h2><p>{profile?.mission || profile?.bio || "I care about making software reliable, useful, and easy to understand."}</p><p>{profile?.philosophy || "Good engineering balances clarity, empathy, and a steady focus on the people using what we build."}</p><Link to="/about" className="inline-link">More about my approach <ArrowUpRight size={15} /></Link></div>
        </div>
      </section>

      <section className="section-block" id="writing">
        <SectionHeading eyebrow="Field notes" title="Ideas worth sharing." description="Notes on software, product craft, and lessons from building." action={<Link to="/blog" className="inline-link">Visit the journal <ArrowUpRight size={15} /></Link>} />
        {posts.length ? posts.slice(0, 3).map((post) => <Link className="blog-row" key={post.id} to={`/blog/${post.slug}`}><span className="blog-date">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "ARTICLE"}</span><div><h3>{post.title}</h3><p>{post.excerpt}</p></div><ArrowUpRight size={16} /></Link>) : <div className="empty-state">No published articles yet. New writing will show up here.</div>}
      </section>

      <section className="section-block" id="contact">
        <div className="contact-band"><span className="eyebrow">Have a project in mind?</span><h2>Have an idea? Let's build something great.</h2><p>Tell me what you're working on. We can shape the next steps together, from a clear scope to a working product.</p><Link to="/contact" className="hero-primary">Start a conversation <ArrowUpRight size={16} /></Link></div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return <motion.div className="stat-item" variants={reveal}><strong className="stat-number">{value}</strong><span className="stat-caption">{label}</span></motion.div>;
}

function SectionHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="section-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div><div>{description && <p>{description}</p>}{action}</div></div>;
}

function ProjectTile({ project, index }: { project: ProjectCard; index: number }) {
  const image = project.images.find((item) => item.isCover) || project.images[0];
  return <motion.article className="project-card" initial="hidden" whileInView="visible" viewport={{ once: true, amount: .2 }} variants={reveal} transition={{ delay: index * .07 }}>
    <Link to={`/projects/${project.slug}`} aria-label={`View ${project.title} project details`}>
      <div className="project-visual">
        {image ? <img src={image.url} alt={image.alt || `${project.title} preview`} loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <div className="project-visual-placeholder"><span><Layers3 size={27} /></span></div>}
        <span className="project-visual-tag">{project.featured ? "FEATURED PROJECT" : project.category?.name || "PROJECT"}</span>
      </div>
      <div className="project-card-body">
        <div className="project-card-heading"><h3>{project.title}</h3><ArrowUpRight size={18} /></div>
        <p>{project.description}</p>
        <div className="project-card-footer"><div className="project-tech-list">{project.technologies.slice(0, 4).map(({ technology }) => <span key={technology.name}>{technology.name}</span>)}</div><span className="inline-link">View details <ArrowRight size={13} /></span></div>
      </div>
    </Link>
  </motion.article>;
}

function SocialGlyph({ icon }: { icon: string }) {
  const normalized = icon.toLowerCase();
  if (normalized.includes("github")) return <FaGithub size={15} />;
  if (normalized.includes("linkedin")) return <FaLinkedinIn size={15} />;
  if (normalized.includes("instagram")) return <FaInstagram size={15} />;
  if (normalized.includes("facebook")) return <FaFacebookF size={15} />;
  if (normalized.includes("mail")) return <FaEnvelope size={15} />;
  return <Braces size={15} />;
}
