import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi, type AdminProject, type AdminBlogPost, type AdminContactMessage } from "../../services/admin";

export default function Dashboard() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [posts, setPosts] = useState<AdminBlogPost[]>([]);
  const [messages, setMessages] = useState<AdminContactMessage[]>([]);

  useEffect(() => {
    (async () => {
      const [ps, bs, ms] = await Promise.all([
        adminApi.projects().catch(() => []),
        adminApi.blogPosts().catch(() => []),
        adminApi.messages().catch(() => []),
      ]);
      setProjects(ps);
      setPosts(bs);
      setMessages(ms);
    })();
  }, []);

  const newMessages = messages.filter((m) => m.status === "NEW").length;
  const drafts = posts.filter((p) => !p.published).length;
  const unpublished = projects.filter((p) => !p.published).length;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-8">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Projects" value={projects.length} note={`${unpublished} draft`} to="/admin/projects" />
        <Stat label="Blog posts" value={posts.length} note={`${drafts} draft`} to="/admin/blog" />
        <Stat label="Messages" value={messages.length} note={`${newMessages} new`} to="/admin/messages" />
      </div>
    </div>
  );
}

function Stat({ label, value, note, to }: { label: string; value: number; note: string; to: string }) {
  return (
    <Link to={to} className="block rounded-lg border border-border bg-surface p-5 hover:border-accent">
      <p className="text-sm text-muted">{label}</p>
      <p className="text-3xl font-semibold mt-1">{value}</p>
      <p className="text-xs text-muted mt-1">{note}</p>
    </Link>
  );
}
