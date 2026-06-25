export function saveBlobAsFile(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

export async function isPdfBlob(blob: Blob): Promise<boolean> {
  const header = await blob.slice(0, 4).text();
  return header.startsWith("%PDF");
}

export async function readBlobMessage(blob: Blob, fallback: string): Promise<string> {
  try {
    const text = await blob.text();
    if (!text.trim()) return fallback;

    try {
      const json = JSON.parse(text) as { message?: string; data?: string };
      if (typeof json.message === "string" && json.message.trim()) return json.message;
      if (typeof json.data === "string" && json.data.trim()) return json.data;
    } catch {
      // Not JSON — use raw text if it looks like an error message.
    }

    return text.length > 200 ? fallback : text;
  } catch {
    return fallback;
  }
}
