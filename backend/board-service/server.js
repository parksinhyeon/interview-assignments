const app = require('./index');
const PORT = process.env.PORT || 3003;

// 서버 인스턴스를 실행
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = server; 