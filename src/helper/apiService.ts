import axios, { type AxiosResponse } from "axios";
import { API_ENDPOINTS, resolveApiUrl } from "./apiList";
import { getAccessToken } from "@/lib/auth";
import { isPdfBlob, readBlobMessage, saveBlobAsFile } from "@/lib/downloadBlob";

export type ApiCallData = {
  endpoint: keyof typeof API_ENDPOINTS;
  token?: string;
  pathParams?: Record<string, string | number>;
} & Record<string, unknown>;

const getAuthHeaders = (token?: string) => {
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

function resolveUrl(data: Pick<ApiCallData, "endpoint" | "pathParams">) {
  return resolveApiUrl(data.endpoint, data.pathParams);
}

export const apiFormPostCall = async (
  endpoint: keyof typeof API_ENDPOINTS,
  formData: FormData,
  token?: string,
) => {
  const url = resolveApiUrl(endpoint);

  try {
    return await axios.post(url, formData, {
      headers: getAuthHeaders(token ?? getAccessToken() ?? undefined),
    });
  } catch (error) {
    console.error("apiFormPostCall error:", error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response;
    }
    throw error;
  }
};

export const apiPostCall = async (data: ApiCallData) => {
  if (!data?.endpoint) {
    return { status: 400, data: { message: "No endpoint provided" } };
  }

  const { endpoint, token, pathParams, ...body } = data;
  const url = resolveUrl({ endpoint, pathParams });

  try {
    return await axios.post(url, body, {
      headers: getAuthHeaders(token ?? getAccessToken() ?? undefined),
    });
  } catch (error) {
    console.error("apiPostCall error:", error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response;
    }
    throw error;
  }
};

export const apiGetCall = async (data: ApiCallData) => {
  if (!data?.endpoint) {
    return { status: 400, data: { message: "No endpoint provided" } };
  }

  const { endpoint, token, pathParams, ...params } = data;
  const url = resolveUrl({ endpoint, pathParams });

  try {
    return await axios.get(url, {
      params,
      headers: getAuthHeaders(token ?? getAccessToken() ?? undefined),
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response;
    }
    console.error("apiGetCall error:", error);
    throw error;
  }
};

export const apiPatchCall = async (data: ApiCallData) => {
  if (!data?.endpoint) {
    return { status: 400, data: { message: "No endpoint provided" } };
  }

  const { endpoint, token, pathParams, ...body } = data;
  const url = resolveUrl({ endpoint, pathParams });

  try {
    return await axios.patch(url, body, {
      headers: getAuthHeaders(token ?? getAccessToken() ?? undefined),
    });
  } catch (error) {
    console.error("apiPatchCall error:", error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response;
    }
    throw error;
  }
};

export const apiDownloadCall = async (
  endpoint: keyof typeof API_ENDPOINTS,
  pathParams: Record<string, string | number>,
  filename: string,
  token?: string,
): Promise<{ ok: true } | { ok: false; message: string }> => {
  const url = resolveUrl({ endpoint, pathParams });
  const authToken = token ?? getAccessToken() ?? undefined;

  try {
    const response = await axios.get(url, {
      headers: getAuthHeaders(authToken),
      responseType: "blob",
      validateStatus: () => true,
    });

    const blob = response.data as Blob;
    const contentType = String(response.headers["content-type"] ?? "");
    const looksLikePdf =
      contentType.includes("application/pdf") ||
      contentType.includes("application/octet-stream") ||
      (await isPdfBlob(blob));

    if (response.status < 200 || response.status >= 300) {
      const message = await readBlobMessage(
        blob,
        `Download failed (${response.status}).`,
      );
      return { ok: false, message };
    }

    if (!looksLikePdf) {
      const message = await readBlobMessage(blob, "Server did not return a PDF file.");
      return { ok: false, message };
    }

    const pdfBlob =
      blob.type === "application/pdf"
        ? blob
        : new Blob([blob], { type: "application/pdf" });

    saveBlobAsFile(pdfBlob, filename);
    return { ok: true };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
      const message = await readBlobMessage(
        error.response.data,
        "Cannot download file.",
      );
      return { ok: false, message };
    }

    console.error("apiDownloadCall error:", error);
    return { ok: false, message: "Cannot download file." };
  }
};

export const apiDeleteCall = async (data: ApiCallData): Promise<AxiosResponse> => {
  if (!data?.endpoint) {
    return { status: 400, data: { message: "No endpoint provided" } } as AxiosResponse;
  }

  const { endpoint, token, pathParams } = data;
  const url = resolveUrl({ endpoint, pathParams });

  try {
    return await axios.delete(url, {
      headers: getAuthHeaders(token ?? getAccessToken() ?? undefined),
    });
  } catch (error) {
    console.error("apiDeleteCall error:", error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response;
    }
    throw error;
  }
};
