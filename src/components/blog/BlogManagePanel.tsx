"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PencilSimpleIcon, TrashIcon, GlobeIcon } from "@phosphor-icons/react";
import { deleteBlog, fetchBlogs, updateBlog, type BlogListStatus } from "@/lib/blogApi";
import { cn } from "@/lib/utils";
import { formatBlogCategory, type Blog } from "@/types/blog";
import ApiMessage from "@/components/ui/ApiMessage";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const TABS: { key: BlogListStatus; label: string }[] = [
  { key: "draft", label: "Drafts" },
  { key: "published", label: "Published" },
  { key: "archived", label: "Archived" },
];

type BlogManagePanelProps = {
  basePath?: string;
};

export default function BlogManagePanel({
  basePath = "/content-manager/blogs",
}: BlogManagePanelProps) {
  const [tab, setTab] = useState<BlogListStatus>("draft");
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Blog | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<number | null>(null);

  async function handlePublish(blogId: number) {
    setPublishingId(blogId);
    setError(null);
    const result = await updateBlog(blogId, { status: "PUBLISHED" });
    if (!result.ok) {
      setError(result.message);
      setPublishingId(null);
      return;
    }
    setPublishingId(null);
    await load();
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await fetchBlogs(tab);
    if (!result.ok) {
      setError(result.message);
      setBlogs([]);
      setLoading(false);
      return;
    }

    setBlogs(result.data);
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    void load();
  }, [load]);

  async function confirmDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    setDeleteError(null);

    const result = await deleteBlog(deleteTarget.blogId);
    if (!result.ok) {
      setDeleteError(result.message);
      setDeleting(false);
      return;
    }

    setDeleteTarget(null);
    setDeleting(false);
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition",
                tab === item.key
                  ? "bg-teal-600 text-white"
                  : "border border-teal-100 bg-white text-zinc-700 hover:bg-teal-50",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <Link
          href={`${basePath}/new`}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        >
          New blog post
        </Link>
      </div>

      {loading && <p className="text-sm text-zinc-500">Loading blogs…</p>}
      {error && <ApiMessage message={error} variant="error" />}

      {!loading && !error && blogs.length === 0 && (
        <p className="rounded-xl border border-teal-100 bg-white p-8 text-center text-sm text-zinc-500">
          No {tab} blogs yet.
        </p>
      )}

      {!loading && !error && blogs.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-teal-100 bg-white">
          <div className="overflow-x-auto scrollbar-hide">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-teal-50 bg-teal-50/40 text-zinc-600">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog.blogId} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-zinc-800">{blog.title}</td>
                  <td className="px-4 py-3 text-zinc-600">
                    {formatBlogCategory(blog.category)}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {new Date(blog.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {tab === "draft" && (
                        <button
                          type="button"
                          disabled={publishingId === blog.blogId}
                          onClick={() => void handlePublish(blog.blogId)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50 transition shadow-sm"
                        >
                          <GlobeIcon size={14} />
                          {publishingId === blog.blogId ? "Publishing…" : "Publish"}
                        </button>
                      )}
                      <Link
                        href={`${basePath}/${blog.blogId}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-teal-100 px-3 py-1.5 text-xs font-medium text-teal-700 hover:bg-teal-50 transition"
                      >
                        <PencilSimpleIcon size={14} />
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteError(null);
                          setDeleteTarget(blog);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-150 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 transition"
                      >
                        <TrashIcon size={14} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete blog post?"
        message={
          deleteTarget
            ? `Permanently delete "${deleteTarget.title}"?`
            : "Delete this blog post?"
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleting}
        error={deleteError}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          if (!deleting) {
            setDeleteTarget(null);
            setDeleteError(null);
          }
        }}
      />
    </div>
  );
}
