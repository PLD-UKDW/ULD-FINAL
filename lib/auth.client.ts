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
  return getCookieValue("authToken");
}

export function isLoggedIn() {
  if (typeof window === "undefined") return false;

  return Boolean(getAuthToken());
}
