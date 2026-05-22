const https = require("https");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, max-age=86400");
  if (req.method === "OPTIONS") return res.status(200).end();
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "missing url" });
  try {
    const opts = { headers: { Referer: "https://mp.weixin.qq.com/", "User-Agent": "Mozilla/5.0" } };
    https.get(url, opts, (imgRes) => {
      const ct = imgRes.headers["content-type"] || "image/jpeg";
      res.setHeader("Content-Type", ct);
      imgRes.pipe(res);
    }).on("error", (e) => res.status(502).json({ error: e.message }));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};