import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Command, Menu, Moon, Search, Sun, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { publicApi, type BlogPostCard, type ProjectCard, type Service, type SkillCategory } from "../services/api";

type ThemeChoice = "dark" | "light" | "system";
type SearchItem = { title: string; detail: string; href: string; kind: string };

const themeChoices: ThemeChoice[] = ["dark", "light", "system"];

function applyTheme(theme: ThemeChoice) {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
}

function readTheme(): ThemeChoice {
  const stored = localStorage.getItem("portfolio-theme");
  return themeChoices.includes(stored as ThemeChoice) ? stored as ThemeChoice : "dark";
}

export default function SiteNavigation() {
  const location = useLocation();
  const [theme, setTheme] = useState<ThemeChoice>(readTheme);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<SearchItem[]>([]);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem("portfolio-theme", theme);
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!searchOpen) return;
    let active = true;
    setQuery("");
    setSelected(0);
    Promise.all([
      publicApi.projects({ limit: 50 }),
      publicApi.skills(),
      publicApi.services(),
      publicApi.blog({ limit: 20 }),
    ]).then(([projects, categories, services, posts]) => {
      if (!active) return;
      setItems(buildSearchItems(projects, categories, services, posts));
      requestAnimationFrame(() => inputRef.current?.focus());
    }).catch(() => {
      if (active) setItems([]);
    });
    return () => { active = false; };
  }, [searchOpen]);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items.slice(0, 8);
    return items.filter((item) => `${item.title} ${item.detail} ${item.kind}`.toLowerCase().includes(normalized)).slice(0, 8);
  }, [items, query]);

  function cycleTheme() {
    setTheme(themeChoices[(themeChoices.indexOf(theme) + 1) % themeChoices.length]);
  }

  function onSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelected((current) => Math.min(current + 1, results.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelected((current) => Math.max(current - 1, 0));
    }
    if (event.key === "Enter" && results[selected]) window.location.assign(results[selected].href);
    if (event.key === "Escape") setSearchOpen(false);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setMenuOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const navLinks = [
    ["Home", "/"],
    ["About", "/about"],
    ["Projects", "/projects"],
    ["Services", "/services"],
    ["Skills", "/#skills"],
    ["Writing", "/blog"],
    ["Library", "/library"],
  ];
  const ThemeIcon = theme === "light" ? Sun : theme === "system" ? Command : Moon;

  return (
    <>
      <header className="site-nav-wrap">
        <div className="site-nav">
          <Link to="/" className="brand-lockup" aria-label="Niyonizeye Dieu Aime, home">
            <span className="brand-mark">DA<span>.</span></span>
            <span className="brand-name">Dieu Aime<span> / portfolio</span></span>
          </Link>
          <nav className="desktop-nav" aria-label="Primary navigation">
            {navLinks.map(([label, href]) => (
              <NavLink key={label} to={href} end={href === "/"} className={({ isActive }) => `nav-link ${isActive && href !== "/#skills" ? "is-active" : ""}`}>
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="nav-actions">
            <button type="button" className="icon-button search-trigger" aria-label="Search the portfolio" onClick={() => setSearchOpen(true)} title="Search (Ctrl K)">
              <Search size={17} />
            </button>
            <button type="button" className="icon-button theme-trigger" aria-label={`Theme: ${theme}. Change theme`} onClick={cycleTheme} title={`Theme: ${theme}`}>
              <ThemeIcon size={17} />
            </button>
            <a className="nav-talk" href="/contact">Let's talk <ArrowUpRight size={14} /></a>
            <button type="button" className="icon-button mobile-menu-trigger" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.nav className="mobile-nav" aria-label="Mobile navigation" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              {navLinks.map(([label, href], index) => <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.035 }}><Link to={href}>{label}<ArrowDownRight size={14} /></Link></motion.div>)}
              <Link to="/contact" className="mobile-contact">Start a project <ArrowUpRight size={15} /></Link>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {searchOpen && (
          <motion.div className="search-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSearchOpen(false); }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.section className="search-panel" role="dialog" aria-modal="true" aria-label="Search portfolio" initial={{ opacity: 0, y: -16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.99 }}>
              <div className="search-input-row">
                <Search size={19} />
                <input ref={inputRef} value={query} onChange={(event) => { setQuery(event.target.value); setSelected(0); }} onKeyDown={onSearchKeyDown} placeholder="Search projects, skills, services, writing..." aria-label="Search portfolio content" />
                <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={18} /></button>
              </div>
              <div className="search-results" role="listbox" aria-label="Search results">
                {results.map((item, index) => (
                  <Link key={`${item.kind}-${item.href}`} to={item.href} role="option" aria-selected={selected === index} className={`search-result ${selected === index ? "selected" : ""}`} onMouseEnter={() => setSelected(index)}>
                    <span className="search-result-type">{item.kind}</span>
                    <span className="search-result-copy"><strong>{item.title}</strong><small>{item.detail}</small></span>
                    <ArrowUpRight size={16} />
                  </Link>
                ))}
                {results.length === 0 && <p className="search-empty">{items.length ? "No matching content. Try another search." : "Portfolio search is unavailable right now."}</p>}
              </div>
              <div className="search-hint"><span><kbd>↑</kbd><kbd>↓</kbd> to navigate</span><span><kbd>enter</kbd> to open</span><span><kbd>esc</kbd> to close</span></div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function buildSearchItems(projects: ProjectCard[], categories: SkillCategory[], services: Service[], posts: BlogPostCard[]): SearchItem[] {
  return [
    ...projects.map((project) => ({ title: project.title, detail: project.description, href: `/projects/${project.slug}`, kind: "Project" })),
    ...categories.flatMap((category) => category.skills.map((skill) => ({ title: skill.name, detail: `${category.name}${skill.description ? ` · ${skill.description}` : ""}`, href: "/#skills", kind: "Skill" }))),
    ...services.map((service) => ({ title: service.title, detail: service.description, href: `/services#${service.slug}`, kind: "Service" })),
    ...posts.map((post) => ({ title: post.title, detail: post.excerpt, href: `/blog/${post.slug}`, kind: "Article" })),
  ];
}
