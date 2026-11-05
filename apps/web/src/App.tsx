import { useEffect, useState } from "react";
import { ArrowUp, ArrowUpRight, Code2, Link2, Mail } from "lucide-react";
import { FaEnvelope, FaFacebookF, FaGithub, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { Link, Outlet, Route, Routes } from "react-router-dom";
import AdminLayout from "./admin/AdminLayout";
import SiteNavigation from "./components/SiteNavigation";
import About from "./pages/About";
import AdminBlog from "./pages/admin/Blog";
import BlogEditor from "./pages/admin/BlogEditor";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";
import Dashboard from "./pages/admin/Dashboard";
import Home from "./pages/Home";
import Login from "./pages/admin/Login";
import Library from "./pages/Library";
import AdminMedia from "./pages/admin/Media";
import AdminMessages from "./pages/admin/Messages";
import NotFound from "./pages/NotFound";
import ProfilePage from "./pages/admin/Profile";
import ProjectEditor from "./pages/admin/ProjectEditor";
import ProjectDetail from "./pages/ProjectDetail";
import AdminProjects from "./pages/admin/Projects";
import Projects from "./pages/Projects";
import Services from "./pages/Services";

function PublicLayout() {
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof import("./services/api").publicApi.profile>> | null>(null);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    let active = true;
    import("./services/api").then(({ publicApi }) => publicApi.profile()).then((data) => {
      if (active) setProfile(data);
    }).catch(() => undefined);
    const onScroll = () => setShowTop(window.scrollY > 560);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      active = false;
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="public-shell">
      <SiteNavigation />
      <main className="public-main"><Outlet /></main>
      <footer className="site-footer">
        <div className="footer-top">
          <div className="footer-intro">
            <Link to="/" className="brand-lockup"><span className="brand-mark">DA<span>.</span></span><span className="brand-name">Dieu Aime<span> / portfolio</span></span></Link>
            <p>{profile?.profile?.bio || "Full-stack software development, from thoughtful interfaces to reliable systems."}</p>
          </div>
          <div className="footer-column"><span className="eyebrow">Explore</span><Link to="/about">About</Link><Link to="/projects">Projects</Link><Link to="/services">Services</Link><Link to="/blog">Writing</Link><Link to="/library">Library</Link></div>
          <div className="footer-column"><span className="eyebrow">Connect</span>{(profile?.profile?.email || "dieuaime480@gmail.com") && <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(profile?.profile?.email || "dieuaime480@gmail.com")}`} target="_blank" rel="noreferrer">{profile?.profile?.email || "dieuaime480@gmail.com"}</a>}{profile?.profile?.phone && <a href={`tel:${profile.profile.phone}`}>{profile.profile.phone}</a>}<span>{profile?.profile?.location || "Rwanda"}</span><div className="footer-socials">{(profile?.socials.length ? profile.socials : [{ id: "github-default", label: "GitHub", url: "https://github.com/Bun-ny480", icon: "github" }, { id: "linkedin-default", label: "LinkedIn", url: "https://www.linkedin.com/feed/", icon: "linkedin" }, { id: "instagram-default", label: "Instagram", url: "https://www.instagram.com/__b.a.v.a.r.d__/", icon: "instagram" }, { id: "facebook-default", label: "Facebook", url: "https://www.facebook.com", icon: "facebook" }, { id: "email-default", label: "Gmail", url: "https://mail.google.com/mail/?view=cm&fs=1&to=dieuaime480@gmail.com", icon: "mail" }]).map((social) => <a key={social.id} href={social.url} aria-label={social.label} target={social.url.startsWith("http") ? "_blank" : undefined} rel={social.url.startsWith("http") ? "noreferrer" : undefined}>{social.icon.toLowerCase().includes("github") ? <FaGithub size={16} /> : social.icon.toLowerCase().includes("linkedin") ? <FaLinkedinIn size={16} /> : social.icon.toLowerCase().includes("instagram") ? <FaInstagram size={16} /> : social.icon.toLowerCase().includes("facebook") ? <FaFacebookF size={16} /> : social.icon.toLowerCase().includes("mail") ? <FaEnvelope size={16} /> : <Code2 size={16} />}</a>)}</div></div>
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} {profile?.profile?.fullName || "Dieu Aime"}</span><span>Designed with intent. Built with care.</span></div>
      </footer>
      {showTop && <button className="back-to-top" type="button" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><ArrowUp size={17} /></button>}
      <a className="floating-contact" href="/contact">Start a project <ArrowUpRight size={15} /></a>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/admin/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route path="/services" element={<Services />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/library" element={<Library />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="projects/new" element={<ProjectEditor />} />
            <Route path="projects/:id" element={<ProjectEditor />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="blog/new" element={<BlogEditor />} />
            <Route path="blog/:id" element={<BlogEditor />} />
            <Route path="media" element={<AdminMedia />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}
