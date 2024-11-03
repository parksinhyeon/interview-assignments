const express = require('express');
const app = express();
const { createDBClient } = require('./db'); 
const PORT = process.env.PORT || 3002;
const bcrypt = require('bcryptjs');
const cors = require('cors');
const authenticateJWT = require('./auth'); 

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let db;

const connectDB = async () => {
    db = createDBClient();
    await db.connect();
    console.log('Successfully connected to the database.');
};

connectDB().catch(err => console.error('Database connection error:', err.stack));

app.get('/', (req, res) => {
    res.send('User Service is running!');
});

// app.listen(PORT, () => {
//     console.log(`User service is running on port ${PORT}`);
// });

// POST /api/users
app.post('/api/users', authenticateJWT, async (req, res) => {
    const { username, email, password } = req.body;
    const isSuperuser = req.user.is_superuser; 

    if (!isSuperuser) {
        return res.status(403).json({ message: 'Only superusers can create users.' });
    }

    try {
        // Check if the email already exists
        const existingEmail = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        console.log('existingEmail : ' + existingEmail)
        if (existingEmail && existingEmail.rows.length > 0) {
            return res.status(409).json({ message: 'Email already in use.' });
        }

    

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            'INSERT INTO users (username, email, password, is_superuser) VALUES ($1, $2, $3, $4) RETURNING *',
            [username, email, hashedPassword, false]
        );

        const newUser = result?.rows[0];
        return res.status(201).json({ message: 'User created successfully.', user: { id: newUser.id, username: newUser.username, email: newUser.email } });
    } catch (error) {
        console.error('Error creating user:', error);
        if (error.code === '23505') {
            return res.status(409).json({ message: 'Email already exists.' });
        }
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// GET /api/users
app.get('/api/users', authenticateJWT, async (req, res) => {
    const isSuperuser = req.user.is_superuser; 

    if (!isSuperuser) {
        return res.status(403).json({ message: 'Only superusers can access user list.' });
    }

    try {
        const result = await db.query('SELECT id, username, email, created_at FROM users');
        return res.status(200).json({ users: result.rows });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// GET /api/users/:id
app.get('/api/users/:id', authenticateJWT, async (req, res) => {
    const userId = req.params.id;
    const isSuperuser = req.user.is_superuser; 

    if (!isSuperuser) {
        return res.status(403).json({ message: 'Only superusers can access user details.' });
    }

    try {
        const result = await db.query('SELECT id, username, email, created_at FROM users WHERE id = $1', [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        return res.status(200).json({ user: result.rows[0] });
    } catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// PUT /api/users/:id
app.put('/api/users/:id', authenticateJWT, async (req, res) => {
    const userId = req.params.id;
    const { username, password } = req.body;
    const isSuperuser = req.user.is_superuser; 

    if (!isSuperuser) {
        return res.status(403).json({ message: 'Only superusers can update users.' });
    }

    try {
        const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

        const result = await db.query(
            'UPDATE users SET username = COALESCE($1, username), password = COALESCE($2, password), updated_at = NOW() WHERE id = $3 RETURNING *',
            [username, hashedPassword, userId]
        );

        if (!result || result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        return res.status(200).json({ message: 'User updated successfully.', user: result.rows[0] });
    } catch (error) {
        if (error.code === '23505') { // Postgres unique violation error code
            return res.status(409).json({ message: 'Username already exists.' });
        }
        console.error('Error updating user:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// DELETE /api/users/:id
app.delete('/api/users/:id', authenticateJWT, async (req, res) => {
    const userId = req.params.id;
    // Ensure userId is not undefined before proceeding
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    const isSuperuser = req.user.is_superuser; 

    if (!isSuperuser) {
        return res.status(403).json({ message: 'Only superusers can delete users.' });
    }

    try {
        const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING *', [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        return res.status(204).send();
    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

module.exports = app;