const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const opts = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'zh-CN,zh;q=0.9'
      }
    };
    https.get(url, opts, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let u = res.headers.location;
        if (!u.startsWith('http')) u = 'https://mp.weixin.qq.com' + u;
        return fetchUrl(u).then(resolve).catch(reject);
      }
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
}

function parseArticle(html) {
  let m, title = '', cover = '';
  m = html.match(/var\s+msg_title\s*=\s*["']([^"']*)["']/);
  if (m) title = m[1];
  m = html.match(/var\s+msg_cdn_url\s*=\s*["']([^"']*)["']/);
  if (m) cover = m[1];
  if (!title) { m = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']*)["']/i); if (m) title = m[1]; }
  if (!cover) { m = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']*)["']/i); if (m) cover = m[1]; }
  if (!title) { m = html.match(/<title>([^<]*)<\/title>/i); if (m) title = m[1]; }
  return { title, cover };
}

function downloadImage(url) {
  return new Promise((resolve) => {
    if (!url) return resolve('');
    if (!url.startsWith('http')) url = 'https:' + url;
    const opts = { headers: { 'Referer': 'https://mp.weixin.qq.com/', 'User-Agent': 'Mozilla/5.0' } };
    https.get(url, opts, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location).then(resolve);
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        resolve('data:image/jpeg;base64,' + buf.toString('base64'));
      });
    }).on('error', () => resolve(''));
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const url = req.query.url;
  if (!url) return res.json({ error: 'missing url' });
  if (!url.includes('mp.weixin.qq.com')) return res.json({ error: 'wechat only' });
  try {
    const html = await fetchUrl(url);
    const data = parseArticle(html);
    const coverB64 = await downloadImage(data.cover);
    res.json({ success: true, title: data.title, cover: data.cover, coverBase64: coverB64 });
  } catch (e) {
    res.json({ error: e.message });
  }
};