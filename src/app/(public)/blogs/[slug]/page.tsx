"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchBlogs } from "@/lib/blogApi";
import { formatBlogCategory, type Blog } from "@/types/blog";
import ApiMessage from "@/components/ui/ApiMessage";

export default function BlogDetailPage() {
  const params = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const result = await fetchBlogs("published");
      if (!result.ok) {
        setError(result.message);
        setLoading(false);
        return;
      }

      const match = result.data.find((item) => item.slug === params.slug);
      if (!match) {
        setError("Article not found.");
        setLoading(false);
        return;
      }

      setBlog(match);
      setLoading(false);
    })();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-zinc-500">Loading article…</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ApiMessage message={error ?? "Article not found."} variant="error" />
        <Link href="/blogs" className="mt-4 inline-block text-sm text-teal-700 underline">
          Back to articles
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/blogs" className="text-sm font-medium text-teal-700 underline">
        ← All articles
      </Link>

      <p className="mt-6 text-sm font-medium uppercase tracking-wide text-teal-600">
        {formatBlogCategory(blog.category)}
      </p>
      <h1 className="mt-2 text-4xl font-bold text-zinc-900">{blog.title}</h1>
      <p className="mt-4 text-lg text-zinc-600">{blog.summary}</p>

      {blog.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={blog.coverImage}
          alt=""
          className="mt-8 w-full rounded-xl border border-teal-100 object-cover"
        />
      )}

      <div className="prose prose-zinc mt-8 max-w-none whitespace-pre-wrap text-zinc-800">
        {blog.content}
      </div>

      {blog.tags && blog.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {blog.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
