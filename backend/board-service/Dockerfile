# board-service/Dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm test  
EXPOSE 3003
CMD ["node", "server.js"]
