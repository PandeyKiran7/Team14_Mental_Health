"use client";

import { useEffect, useState } from "react";
import FormButton from "@/components/formElements/FormButton";
import FormInput from "@/components/formElements/FormInput";
import FormSelect from "@/components/formElements/FormSelect";
import { slugify } from "@/lib/slugify";
import {
  BLOG_CATEGORIES,
  formatBlogCategory,
  type Blog,
  type BlogFormValues,
  type BlogStatus,
} from "@/types/blog";

type BlogFormProps = {
  initial?: Blog | null;
  saving?: boolean;
  error?: string | null;
  onSave: (values: BlogFormValues, status: BlogStatus) => void;
};

const categoryOptions = BLOG_CATEGORIES.map((value) => ({
  value,
  label: formatBlogCategory(value),
}));

const emptyValues: BlogFormValues = {
  title: "",
  slug: "",
  summary: "",
  content: "",
  category: "DIABETES_MANAGEMENT",
  tags: "",
  status: "DRAFT",
  coverImage: "",
};

export default function BlogForm({
  initial,
  saving = false,
  error,
  onSave,
}: BlogFormProps) {
  const [values, setValues] = useState<BlogFormValues>(emptyValues);
  const [slugEdited, setSlugEdited] = useState(false);

  useEffect(() => {
    if (!initial) {
      setValues(emptyValues);
      setSlugEdited(false);
      return;
    }

    setValues({
      title: initial.title,
      slug: initial.slug,
      summary: initial.summary,
      content: initial.content,
      category: initial.category,
      tags: initial.tags?.join(", ") ?? "",
      status: initial.status,
      coverImage: initial.coverImage ?? "",
    });
    setSlugEdited(true);
  }, [initial]);

  function updateField<K extends keyof BlogFormValues>(field: K, value: BlogFormValues[K]) {
    setValues((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "title" && !slugEdited) {
        next.slug = slugify(String(value));
      }
      return next;
    });
  }

  return (
    <form
      className="space-y-4 rounded-xl border border-teal-100 bg-white p-6"
      onSubmit={(event) => event.preventDefault()}
    >
      <FormInput
        name="title"
        label="Title"
        value={values.title}
        onChange={(event) => updateField("title", event.target.value)}
        required
      />

      <FormInput
        name="slug"
        label="Slug"
        value={values.slug}
        onChange={(event) => {
          setSlugEdited(true);
          updateField("slug", slugify(event.target.value));
        }}
        required
      />

      <FormSelect
        name="category"
        label="Category"
        value={values.category}
        onChange={(event) =>
          updateField("category", event.target.value as BlogFormValues["category"])
        }
        options={categoryOptions}
      />

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Summary</label>
        <textarea
          value={values.summary}
          onChange={(event) => updateField("summary", event.target.value)}
          rows={3}
          required
          className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-teal-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Content</label>
        <textarea
          value={values.content}
          onChange={(event) => updateField("content", event.target.value)}
          rows={10}
          required
          className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-teal-500"
        />
      </div>

      <FormInput
        name="tags"
        label="Tags (comma-separated)"
        value={values.tags}
        onChange={(event) => updateField("tags", event.target.value)}
      />

      <FormInput
        name="coverImage"
        label="Cover image URL"
        type="url"
        value={values.coverImage}
        onChange={(event) => updateField("coverImage", event.target.value)}
        hint="Optional. Paste a direct image URL (https://…)."
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <FormButton
          type="button"
          disabled={saving}
          onClick={() => onSave(values, "DRAFT")}
        >
          {saving ? "Saving…" : "Save draft"}
        </FormButton>
        <FormButton
          type="button"
          disabled={saving}
          onClick={() => onSave(values, "PUBLISHED")}
        >
          {saving ? "Saving…" : "Publish"}
        </FormButton>
        {initial && (
          <FormButton
            type="button"
            disabled={saving}
            onClick={() => onSave(values, "ARCHIVED")}
          >
            Archive
          </FormButton>
        )}
      </div>
    </form>
  );
}
