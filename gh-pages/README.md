# pyqzan - 朋友圈集赞截图生成器

微信朋友圈集赞截图生成工具，一键生成点赞评论截图，支持多种样式。

## 在线使用

### 当前站点（截图功能）
https://dengxiaoyuovo.github.io/pyqzan/

### 全功能版（截图 + 获取公众号信息）

部署到 Render（免费，无需手机验证）：

1. 打开 https://render.com
2. 点右上角 "Get Started" → 用 GitHub 账号登录
3. 点 "New +" → "Web Service"
4. 选择仓库 `DengxiaoyuOVO/pyqzan`
5. 配置：
   - Build Command: `PUPPETEER_SKIP_DOWNLOAD=true npm install && npm run build:h5`
   - Start Command: `node weinode/main.js`
6. 点 "Create Web Service"，等几分钟上线

部署后截图功能和获取公众号信息全部可用，零维护。
