self.addEventListener("activate", event => {
    event.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", async event => {
    const req = event.request;
    const url = new URL(req.url);
    const headers = new Headers({
        "Content-Type": req.headers.get("Content-Type"),
    });
    if (location.host === url.host) {
        if ((url.pathname === "/" || url.pathname === "index.html") && url.search === "") {
            headers.set("X-ORIGINAL-METHOD", req.method);
            headers.set("X-ORIGINAL-HOST", "");
            headers.set("X-ORIGINAL-PATH", "");
        } else {
            headers.set("X-ORIGINAL-METHOD", req.method);
            headers.set("X-ORIGINAL-HOST", "");
            headers.set("X-ORIGINAL-PATH", url.pathname + url.search);
        }
    } else {
        headers.set("X-ORIGINAL-METHOD", req.method);
        headers.set("X-ORIGINAL-HOST", url.host);
        headers.set("X-ORIGINAL-PATH", url.pathname + url.search);
    }
    event.respondWith(fetch("/", {
        method: "POST",
        headers,
        body: req.body,
    }));
});
