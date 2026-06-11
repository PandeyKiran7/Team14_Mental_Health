import axios, { type AxiosResponse } from "axios";
import { API_ENDPOINTS, resolveApiUrl } from "./apiList";
import { getAccessToken } from "@/lib/auth";

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
    console.error("apiGetCall error:", error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response;
    }
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

  try {
    const response = await axios.get(url, {
      headers: getAuthHeaders(token ?? getAccessToken() ?? undefined),
      responseType: "blob",
    });

    if (response.status !== 200) {
      return { ok: false, message: "Download failed." };
    }

    const blob = new Blob([response.data], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);

    return { ok: true };
  } catch (error) {
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
