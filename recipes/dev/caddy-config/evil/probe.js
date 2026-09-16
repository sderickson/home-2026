const productDomain =
  document.querySelector('meta[name="product-domain"]')?.getAttribute("content")?.trim() ||
  "docker.localhost";
const apiSubdomain =
  document.querySelector('meta[name="api-subdomain"]')?.getAttribute("content")?.trim() ||
  "api.recipes";
const apiOrigin = `${location.protocol}//${apiSubdomain}.${productDomain}`;
(async () => {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 12_000);
  try {
    const res = await fetch(apiOrigin + "/recipes", {
      credentials: "include",
      signal: ctl.signal,
    });
    clearTimeout(t);
    const text = await res.text();
    document.documentElement.dataset.status = String(res.status);
    document.documentElement.dataset.bodyLen = String(text.length);
    document.documentElement.dataset.peek = text.slice(0, 120);
  } catch (e) {
    clearTimeout(t);
    document.documentElement.dataset.error = String(e);
  }
})();
