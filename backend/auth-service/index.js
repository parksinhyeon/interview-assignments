// index.js
const express = require('express');
const { createDBClient } = require('./db'); 
const app = express();
const PORT = process.env.PORT || 3001; // 기본 포트 설정
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authenticateJWT = require('./auth'); 
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let db;

// 데이터베이스 연결 함수
const connectDB = async () => {
    
    db = createDBClient();
    await db.connect();
    console.log('Successfully connected to the database.');
};
connectDB().catch(err => console.error('Database connection error:', err.stack));



// 서버 상태 확인용 엔드포인트
app.get('/', (req, res) => {
    res.send('Auth Service is running!');
});



// 회원가입 API (비밀번호 해시화 후 저장)
app.post('/api/auth/register', async (req, res) => {
    const { username, email, password } = req.body;

    // 파라미터 누락 확인
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required.' });
    }

    try {
        // 이메일 중복 체크
        const emailCheckResult = await db.query('SELECT * FROM users WHERE email = $1 AND is_deleted = FALSE', [email]);
        console.log('emailCheckResult : ' + emailCheckResult)
        if (emailCheckResult?.rows.length > 0) {
            return res.status(409).json({ message: 'Email already exists.' });
        }

        // 비밀번호 해싱 및 사용자 정보 삽입
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            'INSERT INTO users (username, email, password, is_superuser) VALUES ($1, $2, $3, $4) RETURNING *',
            [username, email, hashedPassword, false]
        );
        console.log(result);    
        const newUser = result.rows[0];
        return res.status(201).json({
            message: 'User registered successfully.',
            user: { id: newUser.id, username: newUser.username, email: newUser.email }
        });
    } catch (error) {
        console.error('Error registering user:', error);
        if (error.code === '23505') {
            return res.status(409).json({ message: 'Email already exists.' });
        }
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// 로그인 API (JWT 발급)
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const query = 'SELECT * FROM users WHERE email = $1 AND is_deleted = FALSE';
        const result = await db.query(query, [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const user = result.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // JWT 생성
        const token = jwt.sign({ userId: user.id, is_superuser: user.is_superuser }, process.env.JWT_SECRET, {
            expiresIn: '1h', // 토큰 유효 기간 설정
        });
        res.json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// 보호된 사용자 데이터 조회 API
app.get('/api/auth/user-data', authenticateJWT, async (req, res) => {
    try {
        const queryResult = await db.query(
            'SELECT id, username, email, created_at, is_superuser FROM users WHERE id = $1 AND is_deleted = FALSE',
            [req.user.userId]
        );

        if (queryResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found or deleted.' });
        }

        const user = queryResult.rows[0];
        return res.json({ message: 'This is a protected route.', user });
    } catch (error) {
        console.error('Error retrieving user data:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});


// 관리자 권한의 슈퍼유저 생성
app.post('/api/auth/createsuperuser', async (req, res) => {
    const { username, email, password } = req.body;

    // 파라미터 누락 확인
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            `INSERT INTO users (username, email, password, is_superuser) VALUES ($1, $2, $3, $4) RETURNING id, username, email, is_superuser`,
            [username, email, hashedPassword, true]
        );

        const superuser = result.rows[0];
        res.status(201).json({ message: 'Superuser created successfully.', superuser });
    } catch (error) {
        console.error("Error creating superuser:", error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});



module.exports = app;
