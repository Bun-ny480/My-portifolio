import { useState } from "react";
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const navClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? "text-fg" : "text-muted hover:text-fg";

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  if (loading) return <div className="max-w-5xl mx-auto px-6 py-16 text-muted">Loading…</div>;
  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  async function onLogout() {
    setError(null);
    try {
      await logout();
      navigate("/admin/login", { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to sign out");
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-xl font-semibold">Portfolio admin</h1>
          <p className="mt-1 text-sm text-muted">{user.email}</p>
        </div>
        <button type="button" className="btn-ghost" onClick={onLogout}>Sign out</button>
        <nav className="flex w-full flex-wrap gap-5 text-sm" aria-label="Admin navigation">
          <NavLink to="/admin" end className={navClass}>Dashboard</NavLink>
          <NavLink to="/admin/projects" className={navClass}>Projects</NavLink>
          <NavLink to="/admin/blog" className={navClass}>Blog</NavLink>
          <NavLink to="/admin/media" className={navClass}>Media library</NavLink>
          <NavLink to="/admin/messages" className={navClass}>Messages</NavLink>
          <NavLink to="/admin/profile" className={navClass}>Profile</NavLink>
          <Link to="/" className="ml-auto text-muted hover:text-fg">View site</Link>
        </nav>
      </header>
      {error && <p role="alert" className="mt-4 text-sm text-red-400">{error}</p>}
      <main className="py-8">
        <Outlet />
      </main>
    </div>
  );
}