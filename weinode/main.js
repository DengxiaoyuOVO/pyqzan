const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const router = require('./router/index.js');

app.use(bodyParser.urlencoded({
    extended: false
}))

app.use((req, res, next) => {
    res.set({
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Max-Age': 1728000,
        'Access-Control-Allow-Origin': req.headers.origin || '*',
        'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
        'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
    })
    req.method === 'OPTIONS' ? res.status(204).end() : next()
})

app.use(express.static('public'))

const frontendPath = path.join(__dirname, '..', 'dist', 'build', 'h5');
const devPath = path.join(__dirname, '..', 'dist', 'dev', 'h5');
const staticPath = fs.existsSync(frontendPath) ? frontendPath : devPath;
app.use(express.static(staticPath));

app.get(/^(?!\/(getWeiDate|uploadWorkPicture|deleteWorkPicture|static|emoticon))/i, (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

router(app)

let server = app.listen(process.env.PORT || 3456);
