import axios from "axios";
import { API_ENDPOINTS, getApiUrl } from "./apiList";

export type PostCallData = {
  endpoint: keyof typeof API_ENDPOINTS;
} & Record<string, unknown>;

export const apiPostCall = async (data: PostCallData) => {
  if (!data?.endpoint) {
    return { status: 400, data: { message: "No endpoint provided" } };
  }

  const { endpoint, ...body } = data;
  const url = getApiUrl(endpoint);

  try {
    return await axios.post(url, body);
  } catch (error) {
    console.error("apiPostCall error:", error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response;
    }
    throw error;
  }
};

export const apiGetCall = async (data: PostCallData) => {
  if (!data?.endpoint) {
    return { status: 400, data: { message: "No endpoint provided" } };
  }

  const { endpoint, ...params } = data;
  const url = getApiUrl(endpoint);

  try {
    return await axios.get(url, { params });
  } catch (error) {
    console.error("apiGetCall error:", error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response;
    }
    throw error;
  }
};
