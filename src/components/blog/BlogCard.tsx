import Link from "next/link";
import { formatBlogCategory, type Blog } from "@/types/blog";

type BlogCardProps = {
  blog: Blog;
  href: string;
};

export default function BlogCard({ blog, href }: BlogCardProps) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-teal-100 bg-white transition hover:border-teal-200"
    >
      {blog.coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={blog.coverImage}
          alt=""
          className="h-44 w-full object-cover"
        />
      ) : (
        <div className="flex h-44 items-center justify-center bg-teal-50 text-sm text-teal-700">
          {formatBlogCategory(blog.category)}
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-teal-600">
          {formatBlogCategory(blog.category)}
        </p>
        <h3 className="mt-2 text-lg font-semibold text-zinc-900 group-hover:text-teal-800">
          {blog.title}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-zinc-600">{blog.summary}</p>
        {blog.publishedAt && (
          <p className="mt-4 text-xs text-zinc-500">
            {new Date(blog.publishedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </Link>
  );
}
