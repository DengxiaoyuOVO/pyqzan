export async function onRequestGet(context) {
  const u = new URL(context.request.url);
  const imgUrl = u.searchParams.get('url');
  const c = { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=86400' };
  if (!imgUrl) return Response.json({ error: 'missing url' }, { headers: c });
  try {
    let url = imgUrl;
    if (!url.startsWith('http')) url = 'https:' + url;
    const r = await fetch(url, {
      headers: { 'Referer': 'https://mp.weixin.qq.com/', 'User-Agent': 'Mozilla/5.0' }
    });
    if (!r.ok) return Response.json({ error: 'fetch failed' }, { headers: c });
    const ab = await r.arrayBuffer();
    const u8 = new Uint8Array(ab);
    let bin = ''; for (let i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
    const b64 = 'data:image/jpeg;base64,' + btoa(bin);
    return Response.json({ data: b64 }, { headers: c });
  } catch (e) {
    return Response.json({ error: e.message }, { headers: c });
  }
}