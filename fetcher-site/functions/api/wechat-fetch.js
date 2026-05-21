export async function onRequestGet(context) {
  const { request } = context;
  const u = new URL(request.url);
  const t = u.searchParams.get('url');
  const c = { 'Access-Control-Allow-Origin': '*' };
  if (!t) return Response.json({ error: 'missing url' }, { headers: c });
  if (!t.includes('mp.weixin.qq.com')) return Response.json({ error: 'not wechat url' }, { headers: c });
  try {
    const res = await fetch(t, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' } });
    const html = await res.text();
    let title = '', cover = '', m;
    m = html.match(/var\s+msg_title\s*=\s*["']([^"']*)["']/);
    if (m) title = m[1];
    if (!title) { m = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']*)["']/i); if (m) title = m[1]; }
    if (!title) { m = html.match(/<title>([^<]*)<\/title>/i); if (m) title = m[1]; }
    m = html.match(/var\s+msg_cdn_url\s*=\s*["']([^"']*)["']/);
    if (m) cover = m[1];
    if (!cover) { m = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']*)["']/i); if (m) cover = m[1]; }
    let b64 = '';
    if (cover) { try {
      if (!cover.startsWith('http')) cover = 'https:' + cover;
      const ir = await fetch(cover, { headers: { 'Referer': 'https://mp.weixin.qq.com/' } });
      const ab = await ir.arrayBuffer();
      const u8 = new Uint8Array(ab);
      let bin = '';
      for (let i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
      b64 = 'data:image/jpeg;base64,' + btoa(bin);
    } catch (e) {} }
    return Response.json({ success: true, title, cover, coverBase64: b64 }, { headers: c });
  } catch (e) { return Response.json({ error: e.message }, { headers: c }); }
}