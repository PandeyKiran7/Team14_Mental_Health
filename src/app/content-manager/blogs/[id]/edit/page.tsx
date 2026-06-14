"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BlogEditor from "@/components/blog/BlogEditor";
import { fetchBlogById } from "@/lib/blogApi";
import type { Blog } from "@/types/blog";
import ApiMessage from "@/components/ui/ApiMessage";

export default function EditBlogPage() {
  const params = useParams<{ id: string }>();
  const blogId = Number(params.id);
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(blogId)) {
      setError("Invalid blog id.");
      setLoading(false);
      return;
    }

    void (async () => {
      const result = await fetchBlogById(blogId);
      if (!result.ok) {
        setError(result.message);
        setLoading(false);
        return;
      }

      setBlog(result.data);
      setLoading(false);
    })();
  }, [blogId]);

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading blog…</p>;
  }

  if (error || !blog) {
    return <ApiMessage message={error ?? "Blog not found."} variant="error" />;
  }

  return <BlogEditor blog={blog} redirectPath="/content-manager/blogs" />;
}
