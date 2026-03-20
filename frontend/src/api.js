const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function buildUrl(base, path) {
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

async function request(url, options = {}) {
  const fullUrl = buildUrl(API, url);

  const res = await fetch(fullUrl, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.detail || `Request failed (${res.status})`);
  }

  return data;
}