self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.pathname === '/api/fetch-wechat' && url.searchParams.has('url')) {
    event.respondWith(handleFetch(url.searchParams.get('url')));
  }
});

async function handleFetch(targetUrl) {
  try {
    const resp = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' }
    });
    if (!resp.ok) {
      return new Response(JSON.stringify({ error: 'fetch failed: ' + resp.status }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const html = await resp.text();
    const title = (html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/) || [, (html.match(/<title>([^<]+)<\/title>/) || [, ''])[1]])[1] || '';
    const cover = (html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/) || [, ''])[1] || '';
    const nickname = (html.match(/var\s+nickname\s*=\s*["']([^"']*)["']/) || [, ''])[1] || '';
    return new Response(JSON.stringify({ success: true, title, cover, nickname }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
