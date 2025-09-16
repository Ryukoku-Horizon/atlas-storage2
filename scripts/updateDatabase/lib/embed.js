import fetch from "node-fetch";

export async function canEmbedIframe(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    const xfo = res.headers.get("x-frame-options");
    const csp = res.headers.get("content-security-policy");

    if (xfo && (xfo.toUpperCase() === "DENY" || xfo.toUpperCase() === "SAMEORIGIN")) {
      return false;
    }

    if (csp && csp.includes("frame-ancestors 'none'")) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}