import { getAccessToken, signOut } from "./auth";

export async function apiFetch(path: string, init: RequestInit = {}) {
  const token = await getAccessToken();
  if (!token)
    throw new Error("Your session has expired. Please sign in again.");
  const base = import.meta.env.VITE_API_URL.replace(/\/$/, "");
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: { ...init.headers, Authorization: `Bearer ${token}` },
  });
  if (response.status === 401) {
    void signOut();
    throw new Error("Your session has expired. Please sign in again.");
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = Array.isArray(body?.message)
      ? body.message.join("; ")
      : body?.message;
    throw new Error(
      typeof message === "string"
        ? message
        : `Request failed (${response.status}).`,
    );
  }
  return response;
}
