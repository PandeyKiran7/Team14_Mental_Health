import { isApiSuccess, resolveApiError } from "@/helper/apiErrors";
import {
  apiDeleteCall,
  apiGetCall,
  apiPatchCall,
  apiPostCall,
} from "@/helper/apiService";
import { getAccessToken } from "@/lib/auth";
import { splitCommaList } from "@/lib/splitList";
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
  return {
    title: values.title.trim(),
    slug: values.slug.trim(),
    summary: values.summary.trim(),
    content: values.content.trim(),
    category: values.category,
    tags: splitCommaList(values.tags),
    status: values.status,
  };
}

const LIST_ENDPOINT = {
  draft: "draft_blogs",
  published: "published_blogs",
  archived: "archived_blogs",
} as const;

export type BlogListStatus = keyof typeof LIST_ENDPOINT;

export async function fetchBlogs(
  status: BlogListStatus,
): Promise<ActionResult<Blog[]>> {
  const response = await apiGetCall({
    endpoint: LIST_ENDPOINT[status],
    token: getToken(),
  });

  if (!isApiSuccess(response.status)) {
    return {
      ok: false,
      message: resolveApiError(response, "Failed to load blogs."),
    };
  }

  return { ok: true, data: normalizeBlogs(response.data) };
}

export async function fetchBlogById(blogId: number): Promise<ActionResult<Blog>> {
  const response = await apiGetCall({
    endpoint: "blog_by_id",
    pathParams: { blogId },
    token: getToken(),
  });

  if (!isApiSuccess(response.status)) {
    return {
      ok: false,
      message: resolveApiError(response, "Failed to load blog."),
    };
  }

  const blog = normalizeBlog(response.data);
  if (!blog) {
    return { ok: false, message: "Blog not found." };
  }

  return { ok: true, data: blog };
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

  return { ok: true, data: blog };
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

  return { ok: true, data: blog };
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
