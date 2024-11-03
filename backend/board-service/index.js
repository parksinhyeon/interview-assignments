// index.js
const express = require('express');
const app = express();
const PORT = process.env.PORT;
const authenticateJWT = require('./auth'); 
const cors = require('cors');
const { createDBClient } = require('./db'); 
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
    res.send('Board Service is running!');
});

// app.listen(PORT, () => {
//     console.log(`Board service is running on port ${PORT}`);
// });

// 게시물 생성 API
app.post('/api/board', authenticateJWT, async (req, res) => {
    const { title, content } = req.body;
    const userId = req.user.userId;

    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required.' });
    }

    try {
        const result = await db.query(
            'INSERT INTO boards (author_id, title, content, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
            [userId, title, content]
        );
        const newPost = result.rows[0];
        return res.status(201).json({ message: 'Post created successfully.', post: newPost });
    } catch (error) {
        console.error('Error creating post:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// 모든 게시물 조회 API (논리적으로 삭제된 게시물 제외)
app.get('/api/board', async (req, res) => {
    try {
        const result = await db.query(
            `SELECT boards.*, users.username 
             FROM boards 
             JOIN users ON boards.author_id = users.id 
             WHERE boards.is_deleted = FALSE`
        );
        return res.json({ posts: result.rows });
    } catch (error) {
        console.error('Error retrieving posts:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// 특정 게시물 조회 API (논리적으로 삭제된 게시물 제외)
app.get('/api/board/:id', async (req, res) => {
    const postId = req.params.id;

    try {
        const result = await db.query(
            'SELECT * FROM boards WHERE id = $1 AND is_deleted = FALSE', [postId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Post not found.' });
        }
        return res.json({ post: result.rows[0] });
    } catch (error) {
        console.error('Error retrieving post:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// 게시물 수정 API (논리적으로 삭제된 게시물 수정 불가)
app.put('/api/board/:id', authenticateJWT, async (req, res) => {
    const postId = req.params.id;
    const { title, content } = req.body;
    const userId = req.user.userId;
    console.log('userId'+ userId);
    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required.' });
    }

    try {
        const postResult = await db.query(
            'SELECT * FROM boards  WHERE id = $1 AND is_deleted = FALSE', [postId]
        );
        const post = postResult.rows[0];

        if (!post || post.author_id !== userId) {
            return res.status(403).json({ message: 'Unauthorized to update this post.' });
        }

        const result = await db.query(
            'UPDATE boards SET title = $1, content = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
            [title, content, postId]
        );
        return res.json({ message: 'Post updated successfully.', post: result.rows[0] });
    } catch (error) {
        console.error('Error updating post:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// 게시물 논리 삭제 API
app.delete('/api/board/:id', authenticateJWT, async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.userId;

    try {
        const postResult = await db.query(
            'SELECT * FROM boards WHERE id = $1 AND is_deleted = FALSE', [postId]
        );
        const post = postResult.rows[0];

        if (!post || post.author_id !== userId) {
            return res.status(403).json({ message: 'Unauthorized to delete this post.' });
        }

        await db.query(
            'UPDATE boards SET is_deleted = TRUE, updated_at = NOW() WHERE id = $1', [postId]
        );
        return res.json({ message: 'Post deleted successfully (soft delete).' });
    } catch (error) {
        console.error('Error deleting post:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});


module.exports = app;