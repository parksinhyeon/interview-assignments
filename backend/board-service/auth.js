const jwt = require('jsonwebtoken');


const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];
    console.log(token);
    if (!token) {
        return res.status(401).json({ message: 'Access token missing.' });
    }
    console.log(process.env.JWT_SECRET);
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log(1111);
            if (err.name === 'TokenExpiredError') {
                // 토큰 만료된 경우
                return res.status(401).json({ message: 'Token expired. Please log in again.' });
            }
            // 기타 토큰 오류 발생
            return res.status(403).json({ message: 'Invalid token.' });
        }
        console.log(2222);
        req.user = user;
        next();
    });
};

module.exports = authenticateJWT;