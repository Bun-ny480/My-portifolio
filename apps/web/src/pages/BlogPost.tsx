import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { publicApi, type BlogPostFull } from "../services/api";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostFull | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        setPost(await publicApi.blogPost(slug));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    })();
  }, [slug]);

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <p className="text-red-400">{error}</p>
        <Link to="/blog" className="mt-4 inline-block">← Back to writing</Link>
      </div>
    );
  }

  if (!post) return <div className="max-w-2xl mx-auto px-6 py-16 text-muted">Loading…</div>;

  return (
    <article className="max-w-2xl mx-auto px-6 py-16">
      <Link to="/blog" className="text-sm text-muted">← All posts</Link>

      <header className="mt-6">
        <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
        <p className="mt-3 text-sm text-muted">
          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}
          {post.category ? ` · ${post.category.name}` : ""}
        </p>
      </header>

      {post.coverUrl && (
        <img src={post.coverUrl} alt="" className="mt-8 rounded-lg border border-border w-full" />
      )}

      <div className="mt-8 leading-relaxed whitespace-pre-wrap">{post.content}</div>

      {post.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2">
          {post.tags.map(({ tag }) => (
            <Link
              key={tag.slug}
              to={`/blog?tag=${tag.slug}`}
              className="text-sm px-3 py-1 rounded bg-surface border border-border hover:border-accent"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
