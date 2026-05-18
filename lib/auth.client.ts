"use client";

function getCookieValue(name: string) {
  if (typeof window === "undefined") return null;

  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : null;
}

export function getAuthToken() {
  if (typeof window === "undefined") return null;

  return localStorage.getItem("token") ?? localStorage.getItem("authToken") ?? getCookieValue("authToken");
}

export function isLoggedIn() {
  if (typeof window === "undefined") return false;

  const token = getAuthToken();
  if (!token) return false;

  // Basic JWT payload expiry check (no signature verification on client)
  try {
    const parts = token.split(".");
    if (parts.length < 2) return false;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (payload && typeof payload.exp === "number") {
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp <= now) {
        // token expired -> clean up stale auth info
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
        try {
          document.cookie = "authToken=; Max-Age=0; path=/";
          document.cookie = "role=; Max-Age=0; path=/";
          document.cookie = "authStage=; Max-Age=0; path=/";
          document.cookie = "pendingRegNumber=; Max-Age=0; path=/";
        } catch (e) {
          // ignore cookie errors
        }
        return false;
      }
    }
  } catch (e) {
    // if token malformed, clear it
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    try {
      document.cookie = "authToken=; Max-Age=0; path=/";
      document.cookie = "role=; Max-Age=0; path=/";
    } catch (er) {}
    return false;
  }

  return true;
}
