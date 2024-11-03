const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createDBClient } = require('./db'); 
require('dotenv').config();

// Express 애플리케이션 생성
const app = require("./index");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB 모듈을 Mock 처리하여 DB 동작을 모방합니다.
jest.mock('./db', () => {
    return {
        createDBClient: jest.fn().mockReturnValue({
            query: jest.fn(), // query 메서드도 모킹합니다.
        }),
    };
});

let db;

beforeAll(() => {
    db = createDBClient(); // Mock된 DB 클라이언트를 가져옵니다.
});

afterEach(() => {
    jest.clearAllMocks(); // 각 테스트가 끝날 때마다 Mock을 초기화합니다.
});

// 인증 토큰 생성 함수
const generateToken = (userId, isSuperuser = false) => {
    return jwt.sign({ userId, isSuperuser }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

describe('게시판 서비스 API', () => {
    let token;
    let postId;

    beforeAll(() => {
        // 테스트에 사용할 인증 토큰 생성 (슈퍼유저 설정 가능)
        token = generateToken(3, true); // 테스트용 사용자 ID 및 슈퍼유저 설정
    });

    // 게시물 생성 테스트
    describe('POST /api/board', () => {
        it('유효한 데이터로 새 게시물을 생성해야 함', async () => {
            db.query.mockImplementationOnce(() => Promise.resolve({ rows: [{id:'1'}] }));
            const res = await request(app)
                .post('/api/board')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Test Post',
                    content: 'This is a test post.',
                });
            
            expect(res.statusCode).toEqual(201);
            expect(res.body.post).toHaveProperty('id');
            postId = res.body.post.id; // 이후 테스트에서 사용할 게시물 ID 저장
        });

        it('제목 또는 내용이 누락된 경우 400 상태 반환', async () => {
            const res = await request(app)
                .post('/api/board')
                .set('Authorization', `Bearer ${token}`)
                .send({ title: '' }); // 내용 누락
            
            expect(res.statusCode).toEqual(400);
        });
    });

    // 모든 게시물 조회 테스트
    describe('GET /api/board', () => {
        it('삭제되지 않은 모든 게시물 조회', async () => {
            db.query.mockImplementationOnce(() => Promise.resolve({
                rows: [
                    {id:'1', title:'test1'},
                    {id:'2', title:'test2'},
                    {id:'3', title:'test3'}
                ]
            }));
            const res = await request(app)
                .get('/api/board')
                .set('Authorization', `Bearer ${token}`); // 인증 토큰 추가
            
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body.posts)).toBe(true);
        });
    });

    // 특정 게시물 조회 테스트
    describe('GET /api/board/:id', () => {
        it('ID로 특정 게시물 조회', async () => {
            db.query.mockImplementationOnce(() => Promise.resolve({ rows: [{ id:postId }] }));
            const res = await request(app)
                .get(`/api/board/${postId}`)
                .set('Authorization', `Bearer ${token}`); // 인증 토큰 추가
            
            expect(res.statusCode).toEqual(200);
            expect(res.body.post).toHaveProperty('id', postId);
        });

        it('존재하지 않는 게시물 ID인 경우 404 상태 반환', async () => {
            db.query.mockImplementationOnce(() => Promise.resolve({ rows: [] }));
            const res = await request(app)
                .get('/api/board/999999') // 존재하지 않는 ID 사용
                .set('Authorization', `Bearer ${token}`);
            
            expect(res.statusCode).toEqual(404);
        });
    });

    // 게시물 수정 테스트
    describe('PUT /api/board/:id', () => {
        it('유효한 데이터로 게시물 수정', async () => {
            db.query.mockImplementationOnce(() => Promise.resolve({ rows: [{ id:postId, title:'Test Post', author_id:3 }] }));
            db.query.mockImplementationOnce(() => Promise.resolve({ rows: [{ id:postId, title:'Updated Test Post', author_id:3 }] }));
            const res = await request(app)
                .put(`/api/board/${postId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Updated Test Post',
                    content: 'This post has been updated.',
                });
            
            expect(res.statusCode).toEqual(200);
            expect(res.body.post).toHaveProperty('title', 'Updated Test Post');
        });

        it('사용자가 권한이 없는 경우 403 상태 반환', async () => {
            db.query.mockImplementationOnce(() => Promise.resolve({ rows: [{ author_id:'1' }] }));
            const invalidToken = generateToken(999); // 다른 사용자 ID로 토큰 생성
            const res = await request(app)
                .put(`/api/board/${postId}`)
                .set('Authorization', `Bearer ${invalidToken}`)
                .send({
                    title: 'Attempted Unauthorized Update',
                    content: 'This should not be allowed.',
                });
            
            expect(res.statusCode).toEqual(403);
        });

        it('제목 또는 내용이 누락된 경우 400 상태 반환', async () => {
            const res = await request(app)
                .put(`/api/board/${postId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ title: '' }); // 내용 누락
            
            expect(res.statusCode).toEqual(400);
        });
    });

    // 게시물 삭제 테스트
    describe('DELETE /api/board/:id', () => {
        it('게시물 소프트 삭제', async () => {
            db.query.mockImplementationOnce(() => Promise.resolve({ rows: [{ id:postId, title:'Updated Test Post', author_id:3 }] }));
            
            const res = await request(app)
                .delete(`/api/board/${postId}`)
                .set('Authorization', `Bearer ${token}`);
            
            expect(res.statusCode).toEqual(200);
        });

        it('사용자가 게시물 삭제 권한이 없는 경우 403 상태 반환', async () => {
            db.query.mockImplementationOnce(() => Promise.resolve({ rows: [{ id:postId, title:'Updated Test Post', author_id:3 }] }));
            
            const invalidToken = generateToken(999); // 다른 사용자 ID로 토큰 생성
            const res = await request(app)
                .delete(`/api/board/${postId}`)
                .set('Authorization', `Bearer ${invalidToken}`);
            
            expect(res.statusCode).toEqual(403);
        });
    });
});
