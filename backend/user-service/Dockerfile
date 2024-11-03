# user-service/Dockerfile
# 1. 베이스 이미지로 Node.js 사용
FROM node:18

# 2. 애플리케이션 디렉토리 생성
WORKDIR /app

# 3. 종속성 설치
COPY package*.json ./
RUN npm install

# 4. 소스 코드 복사
COPY . .

# 5. 테스트 실행
RUN npm test  

# 6. 애플리케이션 실행 포트
EXPOSE 3002

# 7. 앱 실행
CMD ["node", "server.js"]