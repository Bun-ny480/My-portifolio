import { ArrowRight, Briefcase, Code2, Database, Palette, Server, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { publicApi, type Profile, type Service, type SkillCategory } from "../services/api";

type Experience = { id: string; title: string; organization: string; startDate: string; endDate: string | null; description: string };
type Education = { id: string; institution: string; degree: string; startDate: string; endDate: string | null; description: string | null };
type Cert = { id: string; name: string; issuer: string; issuedAt: string; url: string | null };

const capabilityHighlights = [
  { title: "Software Development", description: "From product discovery to deployment planning, I turn requirements into reliable systems that are easy to maintain and scale." },
  { title: "Full-Stack Engineering", description: "I design and connect interfaces, core logic, and databases so the whole application works as a single, dependable product." },
  { title: "Frontend Engineering", description: "I build responsive user interfaces and polished digital experiences that feel clear, fast, and intuitive." },
  { title: "Backend Engineering", description: "I implement secure server-side services, role-aware logic, email flows, and business workflows behind the scenes." },
  { title: "Database Architecture", description: "I model data relationships, protect integrity, and create systems that support growth without becoming fragile." },
  { title: "UI/UX & Graphic Design", description: "I combine usability with visual direction to create experiences that feel both professional and memorable." },
];

function fmt(d: string | null) {
  if (!d) return "Present";
  return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short" });
}

export default function About() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<SkillCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [certs, setCerts] = useState<Cert[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [p, skillData, serviceData, ex, ed, cs] = await Promise.all([
          publicApi.profile(),
          publicApi.skills(),
          publicApi.services(),
          publicApi.experience(),
          publicApi.education(),
          publicApi.certifications(),
        ]);
        setProfile(p.profile);
        setSkills(skillData);
        setServices(serviceData);
        setExperience(ex);
        setEducation(ed);
        setCerts(cs);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      }
    })();
  }, []);

  if (error) return <div className="max-w-3xl mx-auto px-6 py-16 text-red-400">{error}</div>;

  const missionText = profile?.mission || "My mission is to use software engineering and digital creativity to transform real-world challenges into meaningful technological solutions.";
  const visionText = profile?.vision || "To contribute to a future where technology makes everyday activities more productive, connected, efficient, and accessible.";

  return (
    <div className="page-container">
      <section className="hero-section" style={{ minHeight: "auto", paddingTop: "72px", paddingBottom: "32px" }}>
        <div className="hero-copy">
          <span className="status-pill"><span className="status-dot" /> Full-Stack Software Developer</span>
          <h1>Engineering ideas.<br /><span className="gradient-text">Designing experiences.</span><br />Building the future.</h1>
          <p>
            I am a Full-Stack Software Developer and Digital Designer passionate about transforming ideas into functional, intelligent, secure, and scalable digital solutions.
          </p>
          <div className="hero-actions">
            <a href="/contact" className="hero-primary">Start a project <ArrowRight size={15} /></a>
            <a href="/projects" className="hero-secondary">View work</a>
          </div>
          <div className="tech-line">
            <span className="tech-line-label">Specialized in</span>
            <span>Software Development</span>
            <span>Frontend</span>
            <span>Backend</span>
            <span>Database</span>
            <span>UI/UX</span>
          </div>
        </div>

        <aside className="identity-card" aria-label="Professional identity">
          <div className="identity-topline"><span>PROFILE</span><span>01 / 01</span></div>
          <div className="identity-avatar">
            <div className="avatar-index">DA</div>
            {profile?.avatarUrl ? <img src={profile.avatarUrl} alt={profile.fullName || "Dieu Aime"} /> : <div className="monogram">D<span>A</span></div>}
            <div className="avatar-orbit">FULL-STACK</div>
          </div>
          <div className="identity-details">
            <div>
              <h2>{profile?.fullName || "Dieu Aime"}</h2>
              <p>{profile?.headline || "Full-Stack Software Developer"}</p>
            </div>
            <span className="identity-location">{profile?.location || "Rwanda"}</span>
          </div>
          <div className="identity-socials">
            <a href="https://github.com/Bun-ny480" target="_blank" rel="noreferrer" aria-label="GitHub"><Code2 size={13} /></a>
            <a href="https://www.linkedin.com/feed/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Briefcase size={13} /></a>
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=dieuaime480@gmail.com" target="_blank" rel="noreferrer" aria-label="Gmail"><Sparkles size={13} /></a>
          </div>
        </aside>
      </section>

      <section className="section-block" style={{ paddingTop: 12 }}>
        <div className="section-heading">
          <div>
            <span className="eyebrow">Professional profile</span>
            <h2>Building complete digital solutions.</h2>
          </div>
          <p>I work across the full software development lifecycle, combining engineering, design, data modeling, and business thinking into one cohesive delivery process.</p>
        </div>

        <div className="about-band">
          <div className="about-mark"><span>DA</span></div>
          <div className="about-copy">
            <p>{profile?.bio || "I work across the complete software development lifecycle, combining frontend engineering, backend architecture, database management, interface design, and creative problem-solving."}</p>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-fg">Mission</h3>
              <p className="mt-2">{missionText}</p>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-fg">Vision</h3>
              <p className="mt-2">{visionText}</p>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-fg">Core philosophy</h3>
              <p className="mt-2">{profile?.philosophy || "Good engineering balances clarity, empathy, and reliability."}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-block" style={{ paddingTop: 12 }}>
        <div className="section-heading">
          <div>
            <span className="eyebrow">Capabilities</span>
            <h2>Technical capabilities.</h2>
          </div>
          <p>My work spans product thinking, software architecture, systems design, interface design, and implementation across modern web stacks.</p>
        </div>

        <div className="skills-panel" id="skills">
          {skills.length ? skills.map((category) => (
            <div key={category.id} className="skill-group">
              <h3>{category.name}</h3>
              <div className="skill-group-items">
                {category.skills.map((skill) => (
                  <span className="skill-chip" key={skill.id} title={skill.description || undefined}><i />{skill.name}</span>
                ))}
              </div>
            </div>
          )) : <div className="empty-state" style={{ gridColumn: "1 / -1" }}>Technical capabilities are being updated. Check back soon.</div>}
        </div>
      </section>

      <section className="section-block" style={{ paddingTop: 12 }}>
        <div className="section-heading">
          <div>
            <span className="eyebrow">Specializations</span>
            <h2>Focused disciplines.</h2>
          </div>
          <p>I blend engineering rigor with detailed design work so that the delivered product is functional, elegant, and ready for real use.</p>
        </div>

        <div className="service-grid">
          {capabilityHighlights.map((item) => (
            <article key={item.title} className="service-card">
              <div className="service-icon">
                {item.title.includes("Software") ? <Code2 size={20} /> : item.title.includes("Frontend") ? <Palette size={20} /> : item.title.includes("Backend") ? <Server size={20} /> : item.title.includes("Database") ? <Database size={20} /> : <Sparkles size={20} />}
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <a href="/contact" className="inline-link">Discuss this capability <ArrowRight size={14} /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block" style={{ paddingTop: 12 }}>
        <div className="section-heading">
          <div>
            <span className="eyebrow">Services</span>
            <h2>Practical delivery.</h2>
          </div>
          <p>From concept to production, I help businesses and founders build software that is clear, stable, and useful.</p>
        </div>

        <div className="service-grid">
          {services.length ? services.slice(0, 6).map((service) => (
            <article key={service.id} className="service-card">
              <div className="service-icon"><Code2 size={20} /></div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {service.technologies.slice(0, 3).map((tech, idx) => (
                  <span key={`${service.id}-${idx}`} className="skill-chip" style={{ padding: "6px 8px" }}>{tech}</span>
                ))}
              </div>
              <a href="/contact" className="inline-link">Discuss this service <ArrowRight size={14} /></a>
            </article>
          )) : <div className="empty-state" style={{ gridColumn: "1 / -1" }}>Service details are being prepared.</div>}
        </div>
      </section>

      <section className="section-block" style={{ paddingTop: 12 }}>
        <div className="section-heading">
          <div>
            <span className="eyebrow">Experience</span>
            <h2>Background and learning.</h2>
          </div>
          <p>My approach is shaped by constant learning, careful implementation, and a strong focus on dependable product outcomes.</p>
        </div>

        <div className="space-y-6">
          {experience.length === 0 && <p className="text-muted">No experience details published yet.</p>}
          {experience.map((e) => (
            <div key={e.id} className="border-l-2 border-border pl-4">
              <div className="flex justify-between gap-4">
                <div>
                  <h3 className="font-medium">{e.title}</h3>
                  <p className="text-sm text-muted">{e.organization}</p>
                </div>
                <p className="text-sm text-muted whitespace-nowrap">{fmt(e.startDate)} — {fmt(e.endDate)}</p>
              </div>
              <p className="mt-2 text-sm leading-relaxed">{e.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-block" style={{ paddingTop: 12 }}>
        <div className="section-heading">
          <div>
            <span className="eyebrow">Education</span>
            <h2>Academic foundation.</h2>
          </div>
        </div>

        <div className="space-y-6">
          {education.length === 0 && <p className="text-muted">No education details published yet.</p>}
          {education.map((item) => (
            <div key={item.id} className="border-l-2 border-border pl-4">
              <div className="flex justify-between gap-4">
                <div>
                  <h3 className="font-medium">{item.degree}</h3>
                  <p className="text-sm text-muted">{item.institution}</p>
                </div>
                <p className="text-sm text-muted whitespace-nowrap">{fmt(item.startDate)} — {fmt(item.endDate)}</p>
              </div>
              {item.description && <p className="mt-2 text-sm leading-relaxed">{item.description}</p>}
            </div>
          ))}
        </div>
      </section>

      {certs.length > 0 && (
        <section className="section-block" style={{ paddingTop: 12 }}>
          <div className="section-heading">
            <div>
              <span className="eyebrow">Certifications</span>
              <h2>Professional validation.</h2>
            </div>
          </div>
          <ul className="space-y-2">
            {certs.map((c) => (
              <li key={c.id} className="flex items-baseline justify-between gap-4 border-b border-border pb-2">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-sm text-muted">{c.issuer}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted">{new Date(c.issuedAt).getFullYear()}</p>
                  {c.url && <a href={c.url} target="_blank" rel="noreferrer" className="text-xs">verify →</a>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="section-block" style={{ paddingTop: 12 }}>
        <div className="contact-band">
          <span className="eyebrow">Let's build</span>
          <h2>Need a product that feels premium and performs reliably?</h2>
          <p>I help teams and founders turn ideas into digital products that work beautifully, scale clearly, and remain easy to maintain.</p>
          <a href="/contact" className="hero-primary">Book a consultation</a>
        </div>
      </section>
    </div>
  );
}
