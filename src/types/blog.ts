import { extractApiArray, extractApiEntity } from "@/helper/apiResponse";

export const BLOG_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export type BlogStatus = (typeof BLOG_STATUSES)[number];

export const BLOG_CATEGORIES = [
  "DIABETES_MANAGEMENT",
  "NUTRITION_DIET",
  "EXERCISE_FITNESS",
  "MEDICATION_ADHERENCE",
  "MENTAL_HEALTH",
  "LIFESTYLE_CHANGES",
  "PATIENT_EDUCATION",
  "PREVENTION_AWARENESS",
  "COMPLICATIONS",
  "RURAL_HEALTHCARE",
  "CHILD_YOUNG_HEALTH",
  "GENERAL_HEALTH",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export type Blog = {
  blogId: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string | null;
  tags: string[] | null;
  category: BlogCategory;
  status: BlogStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author?: {
    userId: number;
    firstName: string;
    lastName: string;
    email?: string;
  };
};

export type BlogFormValues = {
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: BlogCategory;
  tags: string;
  status: BlogStatus;
  coverImage: string;
};

export function normalizeBlogs(body: unknown): Blog[] {
  return extractApiArray<Blog>(body);
}

export function normalizeBlog(body: unknown): Blog | null {
  return extractApiEntity<Blog>(body, "blogId");
}

export function formatBlogCategory(category: string): string {
  return category
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
