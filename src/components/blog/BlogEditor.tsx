"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import BlogForm from "@/components/blog/BlogForm";
import { saveBlogWithStatus } from "@/lib/blogApi";
import type { Blog, BlogFormValues, BlogStatus } from "@/types/blog";

type BlogEditorProps = {
  blog?: Blog | null;
  redirectPath: string;
};

export default function BlogEditor({ blog = null, redirectPath }: BlogEditorProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(values: BlogFormValues, status: BlogStatus) {
    setSaving(true);
    setError(null);

    const result = await saveBlogWithStatus(blog?.blogId ?? null, values, status);
    if (!result.ok) {
      setError(result.message);
      setSaving(false);
      return;
    }

    router.push(redirectPath);
  }

  return (
    <BlogForm
      initial={blog}
      saving={saving}
      error={error}
      onSave={(values, status) => void handleSave(values, status)}
    />
  );
}
