import { isApiSuccess, resolveApiError } from "@/helper/apiErrors";
import {
  apiDeleteCall,
  apiGetCall,
  apiPatchCall,
  apiPostCall,
} from "@/helper/apiService";
import { getAccessToken } from "@/lib/auth";
import { splitCommaList } from "@/lib/splitList";
import { resolveBlogCoverImageUrl, coverImageForStorage } from "@/lib/blogCoverImage";
import {
  normalizeBlog,
  normalizeBlogs,
  type Blog,
  type BlogFormValues,
  type BlogStatus,
} from "@/types/blog";

type ActionResult<T> = { ok: true; data: T } | { ok: false; message: string };

function getToken(): string | undefined {
  return getAccessToken() ?? undefined;
}

function buildPayload(values: BlogFormValues) {
  const payload: Record<string, unknown> = {
    title: values.title.trim(),
    slug: values.slug.trim(),
    summary: values.summary.trim(),
    content: values.content.trim(),
    category: values.category,
    tags: splitCommaList(values.tags),
    status: values.status,
  };

  const coverImage = values.coverImage?.trim();
  if (coverImage) {
    payload.coverImage = coverImageForStorage(coverImage);
  }

  return payload;
}

const LIST_ENDPOINT = {
  draft: "draft_blogs",
  published: "published_blogs",
  archived: "archived_blogs",
} as const;

export type BlogListStatus = keyof typeof LIST_ENDPOINT;

function withResolvedCoverImage(blog: Blog): Blog {
  return {
    ...blog,
    coverImage: resolveBlogCoverImageUrl(blog.coverImage),
  };
}

export async function fetchBlogs(
  status: BlogListStatus,
  token?: string,
): Promise<ActionResult<Blog[]>> {
  const authToken = token ?? getToken();
  const response = await apiGetCall({
    endpoint: LIST_ENDPOINT[status],
    token: authToken,
  });

  if (!isApiSuccess(response.status)) {
    const message = resolveApiError(response, "Failed to load blogs.");
    if (response.status === 401 && !authToken) {
      return {
        ok: false,
        message: "Please log in to view health articles.",
      };
    }
    return { ok: false, message };
  }

  return { ok: true, data: normalizeBlogs(response.data).map(withResolvedCoverImage) };
}

async function fetchBlogFromLists(blogId: number): Promise<Blog | null> {
  for (const status of ["draft", "published", "archived"] as const) {
    const result = await fetchBlogs(status);
    if (!result.ok) continue;

    const match = result.data.find((blog) => blog.blogId === blogId);
    if (match) return match;
  }

  return null;
}

export async function fetchBlogById(blogId: number): Promise<ActionResult<Blog>> {
  const response = await apiGetCall({
    endpoint: "blog_by_id",
    pathParams: { blogId },
    token: getToken(),
  });

  if (isApiSuccess(response.status)) {
    const blog = normalizeBlog(response.data);
    if (blog) {
      return { ok: true, data: withResolvedCoverImage(blog) };
    }
  }

  const fallback = await fetchBlogFromLists(blogId);
  if (fallback) {
    return { ok: true, data: withResolvedCoverImage(fallback) };
  }

  if (!isApiSuccess(response.status)) {
    return {
      ok: false,
      message: resolveApiError(response, "Failed to load blog."),
    };
  }

  return { ok: false, message: "Blog not found." };
}

export async function createBlog(values: BlogFormValues): Promise<ActionResult<Blog>> {
  const response = await apiPostCall({
    endpoint: "blog_create",
    ...buildPayload(values),
    token: getToken(),
  });

  if (!isApiSuccess(response.status)) {
    return {
      ok: false,
      message: resolveApiError(response, "Failed to create blog."),
    };
  }

  const blog = normalizeBlog(response.data);
  if (!blog) {
    return { ok: false, message: "Blog created but response was invalid." };
  }

  return { ok: true, data: withResolvedCoverImage(blog) };
}

export async function updateBlog(
  blogId: number,
  values: Partial<BlogFormValues>,
): Promise<ActionResult<Blog>> {
  const payload: Record<string, unknown> = {};

  if (values.title !== undefined) payload.title = values.title.trim();
  if (values.slug !== undefined) payload.slug = values.slug.trim();
  if (values.summary !== undefined) payload.summary = values.summary.trim();
  if (values.content !== undefined) payload.content = values.content.trim();
  if (values.category !== undefined) payload.category = values.category;
  if (values.tags !== undefined) payload.tags = splitCommaList(values.tags);
  if (values.status !== undefined) payload.status = values.status;
  if (values.coverImage !== undefined) {
    const coverImage = values.coverImage.trim();
    if (coverImage) payload.coverImage = coverImageForStorage(coverImage);
  }

  const response = await apiPatchCall({
    endpoint: "blog_by_id",
    pathParams: { blogId },
    ...payload,
    token: getToken(),
  });

  if (!isApiSuccess(response.status)) {
    return {
      ok: false,
      message: resolveApiError(response, "Failed to update blog."),
    };
  }

  const blog = normalizeBlog(response.data);
  if (!blog) {
    return { ok: false, message: "Blog updated but response was invalid." };
  }

  return { ok: true, data: withResolvedCoverImage(blog) };
}

export async function deleteBlog(blogId: number): Promise<ActionResult<null>> {
  const response = await apiDeleteCall({
    endpoint: "blog_by_id",
    pathParams: { blogId },
    token: getToken(),
  });

  if (!isApiSuccess(response.status)) {
    return {
      ok: false,
      message: resolveApiError(response, "Failed to delete blog."),
    };
  }

  return { ok: true, data: null };
}

export async function saveBlogWithStatus(
  blogId: number | null,
  values: BlogFormValues,
  status: BlogStatus,
): Promise<ActionResult<Blog>> {
  const payload = { ...values, status };

  if (blogId == null) {
    return createBlog(payload);
  }

  return updateBlog(blogId, payload);
}
