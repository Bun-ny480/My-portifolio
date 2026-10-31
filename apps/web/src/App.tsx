import { Routes, Route, Link, NavLink } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Services from "./pages/Services";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const navClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? "text-fg" : "text-muted hover:text-fg";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border sticky top-0 bg-bg/80 backdrop-blur z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-semibold tracking-tight">
            Niyonizeye Dieu Aime
          </Link>
          <nav className="flex gap-5 text-sm">
            <NavLink to="/" end className={navClass}>Home</NavLink>
            <NavLink to="/about" className={navClass}>About</NavLink>
            <NavLink to="/projects" className={navClass}>Projects</NavLink>
            <NavLink to="/services" className={navClass}>Services</NavLink>
            <NavLink to="/blog" className={navClass}>Writing</NavLink>
            <NavLink to="/contact" className={navClass}>Contact</NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="/services" element={<Services />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-6 text-sm text-muted">
          © {new Date().getFullYear()} Niyonizeye Dieu Aime
        </div>
      </footer>
    </div>
  );
}
