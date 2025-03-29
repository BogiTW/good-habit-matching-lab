FROM node:16-alpine

WORKDIR /app

# 只複製 package 文件，提高緩存效率
COPY package*.json ./
RUN npm install

# 複製其他源碼文件
COPY . .

# 確保能夠存儲數據
RUN mkdir -p data && chmod 777 data

# 設置環境變數
ENV NODE_ENV=production
ENV PORT=3000

# 暴露端口
EXPOSE 3000

# 啟動應用
CMD ["npm", "start"] 