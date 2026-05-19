// Vercel Serverless Function - 获取公众号文章信息
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: '缺少 url 参数' });
  }

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)' }
    });
    const html = await response.text();
    
    // 提取 og:title
    const titleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"/i);
    const title = titleMatch ? titleMatch[1] : '未获取到标题';
    
    // 提取 og:image
    const imgMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"/i);
    const imgUrl = imgMatch ? imgMatch[1] : '';
    
    return res.json({ title, imgUrl });
  } catch (e) {
    return res.status(500).json({ error: '获取失败: ' + e.message });
  }
}
