const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createDBClient } = require('./db');
require('dotenv').config();

const app = require('./index');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 모킹된 DB 클라이언트 설정
jest.mock('./db', () => {
    return {
        createDBClient: jest.fn().mockReturnValue({
            query: jest.fn(),
        }),
    };
});

let db;

beforeAll(() => {
    db = createDBClient();
});

afterEach(() => {
    jest.clearAllMocks();
});

// 슈퍼유저 토큰 생성 함수
const createSuperuserToken = () => {
    const user = { id: 1, username: 'superuser', is_superuser: true };
    return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// 엔드포인트 테스트
describe('User Management API', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/users', () => {
      
        it('사용자를 생성합니다', async () => {
            const token = createSuperuserToken();

            // 사용자 생성 쿼리 모킹
            db.query.mockImplementationOnce(() => Promise.resolve({ rows: [] })); // 이메일 중복 체크
            db.query.mockImplementationOnce(() => Promise.resolve({
                rows: [{ id: 3, username: 'testuser3', email: 'test3@example.com' }]
            }));

            const res = await request(app)
                .post('/api/users')
                .set('Authorization', `Bearer ${token}`)
                .send({ username: 'testuser3', email: 'test3@example.com', password: 'password123' });

            expect(res.status).toBe(201);
            expect(res.body.user.id).toBeDefined();
        });

        it('슈퍼유저가 아닌 경우 403 상태 코드를 반환합니다', async () => {
            const token = jwt.sign({ id: 2, username: 'normaluser', is_superuser: false }, process.env.JWT_SECRET);
            const res = await request(app)
                .post('/api/users')
                .set('Authorization', `Bearer ${token}`)
                .send({ username: 'testuser4', email: 'test4@example.com', password: 'password123' });

            expect(res.status).toBe(403);
        });

        it('중복 이메일이 있는 경우 409 상태 코드를 반환합니다', async () => {
            const token = createSuperuserToken();
            
            db.query.mockImplementationOnce(() => Promise.resolve({ rows: [{ email: 'test5@example.com' }] }));

            const res = await request(app)
                .post('/api/users')
                .set('Authorization', `Bearer ${token}`)
                .send({ username: 'testuser5', email: 'test5@example.com', password: 'password123' });

            expect(res.status).toBe(409);
        });
    });

    describe('GET /api/users', () => {
        it('사용자 목록을 가져옵니다', async () => {
            const token = createSuperuserToken();
            db.query.mockImplementationOnce(() => Promise.resolve({
                rows: [
                    { id: 1, username: 'testuser1', email: 'test1@example.com' },
                    { id: 2, username: 'testuser2', email: 'test2@example.com' },
                    { id: 3, username: 'testuser3', email: 'test3@example.com' }
                ]
            }));

            const res = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.users).toHaveLength(3);
        });
    });

    describe('DELETE /api/users/:id', () => {
        it('사용자를 삭제합니다', async () => {
            const token = createSuperuserToken();
            const createdUserId = 1;

            // 삭제 쿼리 모킹
            db.query.mockImplementationOnce(() => Promise.resolve({ rows: [{ id: createdUserId }] }));

            const res = await request(app)
                .delete(`/api/users/${createdUserId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(204);

            // 삭제 후 사용자 목록 확인
            db.query.mockResolvedValueOnce({ rows: [] }); // 삭제 후 빈 사용자 목록

            const listRes = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${token}`);

            expect(listRes.status).toBe(200);
            expect(listRes.body.users).toHaveLength(0);
        });
    });
});
