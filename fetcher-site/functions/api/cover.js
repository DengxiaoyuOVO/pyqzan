export async function onRequestGet(context) {
  const u = new URL(context.request.url);
  const imgUrl = u.searchParams.get('url');
  const c = { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=86400' };
  if (!imgUrl) return new Response('missing url', { status: 400, headers: c });
  try {
    let url = imgUrl;
    if (!url.startsWith('http')) url = 'https:' + url;
    const ct = url.match(/\.(png|webp|gif)/i) ? 'image/' + url.match(/\.(png|webp|gif)/i)[1].toLowerCase() : 'image/jpeg';
    const r = await fetch(url, {
      headers: { 'Referer': 'https://mp.weixin.qq.com/', 'User-Agent': 'Mozilla/5.0' }
    });
    if (!r.ok) return new Response('fetch failed', { status: 502, headers: c });
    const ab = await r.arrayBuffer();
    return new Response(ab, { headers: { ...c, 'Content-Type': r.headers.get('Content-Type') || ct } });
  } catch (e) {
    return new Response(e.message, { status: 500, headers: c });
  }
}