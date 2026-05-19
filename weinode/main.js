const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const router = require('./router/index.js');

app.use(bodyParser.urlencoded({
	extended: false
}))

app.use((req, res, next) => {
	//è®¾ç½®è¯·æ±‚å¤?
	res.set({
		'Access-Control-Allow-Credentials': true,
		'Access-Control-Max-Age': 1728000,
		'Access-Control-Allow-Origin': req.headers.origin || '*',
		'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
		'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
	})
	req.method === 'OPTIONS' ? res.status(204).end() : next()
})

app.use(express.static('public'));
// ÍĞ¹ÜÇ°¶Ë H5 ¾²Ì¬ÎÄ¼ş
app.use(express.static(path.join(__dirname, '..', 'dist', 'build', 'h5')));
// SPA fallback - serve index.html for all non-API routes
app.get(/^(?!\/(getWeiDate|uploadWorkPicture|deleteWorkPicture|static|emoticon))/i, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'build', 'h5', 'index.html'));
});

router(app)

let server = app.listen(3456);
