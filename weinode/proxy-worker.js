const https = require('https');
const fs = require('fs');
const path = require('path');

function fetchWechat(url, callback, depth) {
  if (!depth) depth = 0;
  if (depth > 5) return callback(null, '');
  
  const opts = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'zh-CN,zh;q=0.9'
    }
  };
  
  https.get(url, opts, (pr) => {
    if (pr.statusCode >= 300 && pr.statusCode < 400 && pr.headers.location) {
      let redirectUrl = pr.headers.location;
      if (!redirectUrl.startsWith('http')) {
        redirectUrl = 'https://mp.weixin.qq.com' + (redirectUrl.startsWith('/') ? '' : '/') + redirectUrl;
      }
      return fetchWechat(redirectUrl, callback, depth + 1);
    }
    
    let b = '';
    pr.on('data', ch => b += ch);
    pr.on('end', () => {
      let ti = (b.match(/var\s+msg_title\s*=\s*["']([^"']*)["']/)||[,""])[1]||'';
      let co = (b.match(/var\s+msg_cdn_url\s*=\s*["']([^"']*)["']/)||[,""])[1]||'';
      let ni = (b.match(/var\s+nickname\s*=\s*["']([^"']*)["']/)||[,""])[1]||'';
      
      if (!ti) ti = (b.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']*)["']/i)||[,""])[1]||'';
      if (!co) co = (b.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']*)["']/i)||[,""])[1]||'';
      if (!ti) ti = (b.match(/<title>([^<]*)<\/title>/i)||[,""])[1]||'';
      
      callback(null, { ti, co, ni });
    });
  }).on('error', e => callback(e));
}

function downloadImage(imgUrl, callback) {
  if (!imgUrl) return callback(null, null);
  if (!imgUrl.startsWith('http')) imgUrl = 'https:' + imgUrl;
  
  const articleDir = path.join(__dirname, 'public', 'article');
  if (!fs.existsSync(articleDir)) fs.mkdirSync(articleDir, { recursive: true });
  
  const filename = 'article-' + Date.now() + '.jpeg';
  const filepath = path.join(articleDir, filename);
  
  const opts = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://mp.weixin.qq.com/'
    }
  };
  
  https.get(imgUrl, opts, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      return downloadImage(res.headers.location, callback);
    }
    const ws = fs.createWriteStream(filepath);
    res.pipe(ws);
    ws.on('finish', () => {
      ws.close();
      callback(null, '/article/' + filename);
    });
  }).on('error', (e) => {
    console.log('Image download failed:', e.message);
    callback(null, imgUrl);
  });
}

module.exports = function(app) {
  app.get('/api/cover', (req, res) => {
    const imgUrl = req.query.url;
    if (!imgUrl) return res.status(400).send('missing url');
    let url = imgUrl;
    if (!url.startsWith('http')) url = 'https:' + url;
    const opts = {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://mp.weixin.qq.com/'
      }
    };
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cache-Control', 'public, max-age=86400');
    https.get(url, opts, (pr) => {
      if (pr.statusCode >= 300 && pr.statusCode < 400 && pr.headers.location) {
        const redirectUrl = pr.headers.location;
        https.get(redirectUrl, opts, (pr2) => {
          res.set('Content-Type', pr2.headers['content-type'] || 'image/jpeg');
          pr2.pipe(res);
        }).on('error', () => res.status(502).send('fetch failed'));
      } else {
        res.set('Content-Type', pr.headers['content-type'] || 'image/jpeg');
        pr.pipe(res);
      }
    }).on('error', () => res.status(502).send('fetch failed'));
  });
  
  app.get('/api/wechat-fetch', (req, res) => {
    const t = req.query.url;
    if (!t) return res.json({ error: 'missing url' });
    if (!t.includes('mp.weixin.qq.com')) return res.json({ error: 'wechat only' });
    
    fetchWechat(t, (err, data) => {
      if (err) return res.json({ error: err.message });
      downloadImage(data.co, (imgErr, localPath) => {
        res.json({ 
          success: true, 
          title: data.ti, 
          cover: localPath || data.co, 
          nickname: data.ni 
        });
      });
    });
  });
};
