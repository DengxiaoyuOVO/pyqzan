FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN PUPPETEER_SKIP_DOWNLOAD=true npm install
COPY . .
RUN PUPPETEER_SKIP_DOWNLOAD=true npm run build:h5
WORKDIR /app/weinode
RUN npm install
EXPOSE 3456
CMD ["node", "main.js"]
