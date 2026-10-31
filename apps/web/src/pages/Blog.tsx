import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { publicApi, type BlogPostCard } from "../services/api";

export default function Blog() {
  const [posts, setPosts] = useState<BlogPostCard[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setPosts(await publicApi.blog({ limit: 20 }));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    })();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Writing</h1>
      <p className="mt-2 text-muted">Notes on software and craft.</p>

      {error && <p className="mt-6 text-red-400">{error}</p>}

      {posts.length === 0 && !error && (
        <p className="mt-10 text-muted">No posts yet.</p>
      )}

      <div className="mt-10 space-y-8">
        {posts.map((p) => (
          <article key={p.id} className="border-b border-border pb-8">
            <Link to={`/blog/${p.slug}`} className="block group">
              <h2 className="text-xl font-medium group-hover:text-accent transition">
                {p.title}
              </h2>
              <p className="mt-2 text-muted leading-relaxed">{p.excerpt}</p>
              <p className="mt-3 text-sm text-muted">
                {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : ""}
                {p.category ? ` · ${p.category.name}` : ""}
              </p>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
