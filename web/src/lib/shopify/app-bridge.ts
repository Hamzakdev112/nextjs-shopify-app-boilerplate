const READY_EVENT = "shopify:ready";

export function isEmbeddedAdmin(): boolean {
  const params = new URLSearchParams(window.location.search);
  return (
    params.get("embedded") === "1" ||
    params.has("id_token") ||
    params.has("host")
  );
}

export function waitForAppBridge(timeoutMs = 8000): Promise<boolean> {
  if (window.shopify) return Promise.resolve(true);

  return new Promise((resolve) => {
    let settled = false;

    const done = (ok: boolean) => {
      if (settled) return;
      settled = true;
      document.removeEventListener(READY_EVENT, onReady);
      window.clearInterval(poll);
      window.clearTimeout(timer);
      resolve(ok);
    };

    const onReady = () => done(Boolean(window.shopify));
    document.addEventListener(READY_EVENT, onReady);

    const poll = window.setInterval(() => {
      if (window.shopify) done(true);
    }, 50);

    const timer = window.setTimeout(() => done(Boolean(window.shopify)), timeoutMs);
  });
}
