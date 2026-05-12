// import axios from "axios";

// export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

// const api = axios.create({ baseURL: API_BASE });

// api.interceptors.request.use((config) => {
// 	if (typeof config.url === "string" && config.url.startsWith("/admin/")) {
// 		config.url = `/api${config.url}`;
// 	}

// 	if (typeof window !== "undefined") {
// 		const token = localStorage.getItem("token");
// 		const isAuthedPath = typeof config.url === "string" && (config.url.startsWith("/api/admin/") || config.url.startsWith("/api/test/"));
// 		const hasAuthHeader = !!config.headers?.Authorization;

// 		if (token && isAuthedPath && !hasAuthHeader) {
// 			config.headers = config.headers ?? {};
// 			config.headers.Authorization = `Bearer ${token}`;
// 		}
// 	}

// 	return config;
// });

// export async function postJson(path: string, body: unknown) {
// 	const url = `${API_BASE}${path}`;
// 	const res = await fetch(url, {
// 		method: "POST",
// 		headers: { "Content-Type": "application/json" },
// 		body: JSON.stringify(body ?? {}),
// 	});

// 	let data: any = {};
// 	try {
// 		data = await res.json();
// 	} catch {
// 		data = {};
// 	}

// 	if (!res.ok) {
// 		const message = data?.message || `Request failed (${res.status})`;
// 		throw new Error(message);
// 	}

// 	return data;
// }

// export default api;

import { getAuthToken } from "@/lib/auth.client";
import axios from "axios";

const rawApiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
export const API_BASE = rawApiBase.replace(/\/api$/, "");

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = getAuthToken();

    const isAuthedPath = typeof config.url === "string" && (config.url.startsWith("/admin") || config.url.startsWith("/test"));

    const hasAuthHeader = !!config.headers?.Authorization;

    if (token && isAuthedPath && !hasAuthHeader) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export async function postJson(path: string, body: unknown) {
  const res = await fetch(`/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });

  let data: any = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    const message = data?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

export default api;
