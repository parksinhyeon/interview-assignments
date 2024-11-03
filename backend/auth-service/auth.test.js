const request = require('supertest');
const app = require("./index");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createDBClient } = require('./db'); 
require('dotenv').config();

// 데이터베이스 클라이언트 모킹 설정
jest.mock('./db', () => {
    return {
        createDBClient: jest.fn().mockReturnValue({
            query: jest.fn(),
        }),
    };
});

let db;

// 테스트 전에 모킹된 DB 클라이언트를 설정합니다.
beforeAll(() => {
    db = createDBClient();
});

// 각 테스트 후 모킹 초기화
afterEach(() => {
    jest.clearAllMocks();
});

// 서버 상태 확인 테스트
describe('GET /', () => {
    it('서버 상태를 확인합니다', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        // expect(res.text).toEqual('Auth Service is running!');
    });
});

// 회원가입 테스트
describe('POST /api/auth/register', () => {
    it('사용자를 등록합니다', async () => {
        const newUser = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        };

        db.query.mockImplementationOnce(() => Promise.resolve({ rows: [] })); // 이메일 중복 체크
        db.query.mockImplementationOnce(() => Promise.resolve({ rows: [{ id: 1, username: newUser.username, email: newUser.email }] })); // 사용자 삽입 결과

        const res = await request(app)
            .post('/api/auth/register')
            .send(newUser);

        expect(res.statusCode).toEqual(201);
        expect(res.body.user.username).toEqual(newUser.username);
    });

    it('중복 이메일로 사용자 등록을 방지합니다', async () => {
        const newUser = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        };

        db.query.mockImplementationOnce(() => Promise.resolve({ rows: [{ email: newUser.email }] }));

        const res = await request(app)
            .post('/api/auth/register')
            .send(newUser);

        expect(res.statusCode).toEqual(409);
    });

    it('회원가입 파라미터가 부족하면 400을 반환합니다', async () => {
        const incompleteUser = { email: 'test2@example.com', password: 'password123' };

        const res = await request(app)
            .post('/api/auth/register')
            .send(incompleteUser);

        expect(res.statusCode).toEqual(400);
    });
});

// 로그인 테스트
describe('POST /api/auth/login', () => {
    it('사용자를 로그인합니다', async () => {
        const loginUser = {
            email: 'test@example.com',
            password: 'password123'
        };

        const hashedPassword = await bcrypt.hash(loginUser.password, 10);
        db.query.mockImplementationOnce(() => Promise.resolve({ rows: [{ id: 1, email: loginUser.email, password: hashedPassword }] }));

        const res = await request(app)
            .post('/api/auth/login')
            .send(loginUser);

        expect(res.statusCode).toEqual(200);
        expect(res.body.token).toBeDefined();
    });

    it('잘못된 자격 증명으로 로그인 실패합니다', async () => {
        const loginUser = {
            email: 'invalid@example.com',
            password: 'wrongpassword'
        };

        db.query.mockImplementationOnce(() => Promise.resolve({ rows: [] }));

        const res = await request(app)
            .post('/api/auth/login')
            .send(loginUser);

        expect(res.statusCode).toEqual(401);
    });

    it('로그인 파라미터가 부족하면 400을 반환합니다', async () => {
        const incompleteLoginUser = { email: 'test@example.com' };

        const res = await request(app)
            .post('/api/auth/login')
            .send(incompleteLoginUser);

        expect(res.statusCode).toEqual(400);
    });
});

// 슈퍼유저 생성 테스트
describe('POST /api/auth/createsuperuser', () => {
    it('슈퍼유저를 생성합니다', async () => {
        const superUser = {
            username: 'adminuser',
            email: 'admin@example.com',
            password: 'admin123'
        };

        db.query.mockImplementationOnce(() => Promise.resolve({ rows: [{ id: 1, ...superUser }] }));

        const res = await request(app)
            .post('/api/auth/createsuperuser')
            .send(superUser);

        expect(res.statusCode).toEqual(201);
    });

    it('슈퍼유저 생성 파라미터가 부족하면 400을 반환합니다', async () => {
        const incompleteSuperUser = { username: 'adminuser', password: 'admin123' };

        const res = await request(app)
            .post('/api/auth/createsuperuser')
            .send(incompleteSuperUser);

        expect(res.statusCode).toEqual(400);
    });
});

// 사용자 데이터 조회 테스트
describe('GET /api/auth/user-data', () => {
    it('사용자 데이터를 조회합니다', async () => {
        const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET);

        db.query.mockImplementationOnce(() => Promise.resolve({ rows: [{ id: 1, username: 'testuser', email: 'test@example.com' }] }));

        const res = await request(app)
            .get('/api/auth/user-data')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
    });

    it('존재하지 않는 사용자 데이터에 대해 404를 반환합니다', async () => {
        const token = jwt.sign({ userId: 99 }, process.env.JWT_SECRET);

        db.query.mockImplementationOnce(() => Promise.resolve({ rows: [] }));

        const res = await request(app)
            .get('/api/auth/user-data')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual('User not found or deleted.');
    });

    it('인증 토큰이 없으면 401을 반환합니다', async () => {
        const res = await request(app)
            .get('/api/auth/user-data');

        expect(res.statusCode).toEqual(401);
    });
});
