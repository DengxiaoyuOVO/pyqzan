self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.pathname.includes('/api/fetch-wechat') && url.searchParams.has('url')) {
    event.respondWith(handleFetch(url.searchParams.get('url')));
  }
});

async function handleFetch(targetUrl) {
  try {
    const resp = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' }
    });
    if (!resp.ok) return json({ error: 'fetch failed: ' + resp.status }, 502);
    const html = await resp.text();
    const title = (html.match(/<meta\s+property=\s*["']og:title["']\s+content=\s*["']([^"']+)["']/i) || [, (html.match(/<title>([^<]+)<\/title>/i) || [, ''])[1]])[1] || '';
    const cover = (html.match(/<meta\s+property=\s*["']og:image["']\s+content=\s*["']([^"']+)["']/i) || [, ''])[1] || '';
    return json({ success: true, title, cover });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
