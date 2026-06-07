import axios from "axios";
import { API_ENDPOINTS, getApiUrl } from "./apiList";

export type ApiCallData = {
  endpoint: keyof typeof API_ENDPOINTS;
  token?: string;
} & Record<string, unknown>;

const getAuthHeaders = (token?: string) => {
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

export const apiPostCall = async (data: ApiCallData) => {
  if (!data?.endpoint) {
    return { status: 400, data: { message: "No endpoint provided" } };
  }

  const { endpoint, token, ...body } = data;
  const url = getApiUrl(endpoint);

  try {
    return await axios.post(url, body, {
      headers: getAuthHeaders(token),
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

  const { endpoint, token, ...params } = data;
  const url = getApiUrl(endpoint);

  try {
    return await axios.get(url, {
      params,
      headers: getAuthHeaders(token),
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

  const { endpoint, token, ...body } = data;
  const url = getApiUrl(endpoint);

  try {
    return await axios.patch(url, body, {
      headers: getAuthHeaders(token),
    });
  } catch (error) {
    console.error("apiPatchCall error:", error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response;
    }
    throw error;
  }
};
