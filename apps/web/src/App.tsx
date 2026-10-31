import { Routes, Route, Link, NavLink } from "react-router-dom";
import Home from "./pages/Home";

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted">That page does not exist.</p>
      <Link to="/">Go home</Link>
    </div>
  );
}

const navClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? "text-fg" : "text-muted hover:text-fg";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-semibold tracking-tight">Niyonizeye Dieu Aime</Link>
          <nav className="flex gap-6 text-sm">
            <NavLink to="/" end className={navClass}>Home</NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
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
