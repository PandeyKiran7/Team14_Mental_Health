"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BlogCard from "@/components/blog/BlogCard";
import { fetchBlogs } from "@/lib/blogApi";
import { getAccessToken } from "@/lib/auth";
import type { Blog } from "@/types/blog";
import ApiMessage from "@/components/ui/ApiMessage";

export default function PublicBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);

  useEffect(() => {
    void (async () => {
      const token = getAccessToken() ?? undefined;
      const result = await fetchBlogs("published", token);

      if (!result.ok) {
        setNeedsLogin(result.message.toLowerCase().includes("log in"));
        setError(result.message);
        setLoading(false);
        return;
      }

      setBlogs(result.data);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold text-teal-800">Health articles</h1>

      {loading && <p className="text-sm text-zinc-500">Loading articles…</p>}

      {error && (
        <div className="space-y-3">
          <ApiMessage message={error} variant="error" />
          {needsLogin && (
            <p className="text-sm text-zinc-600">
              <Link href="/login" className="font-medium text-teal-700 underline">
                Log in
              </Link>{" "}
              to read health articles.
            </p>
          )}
        </div>
      )}

      {!loading && !error && blogs.length === 0 && (
        <p className="rounded-xl border border-teal-100 bg-white p-8 text-center text-sm text-zinc-500">
          No published articles yet.
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog) => (
          <BlogCard key={blog.blogId} blog={blog} href={`/blogs/${blog.slug}`} />
        ))}
      </div>
    </div>
  );
}
