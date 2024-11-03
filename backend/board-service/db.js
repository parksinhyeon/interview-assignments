// db.js
const { Client } = require('pg');

const createDBClient = () => {
    return new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });
};

const connectDB = async () => {
    const client = createDBClient(); // Create a new database client
    try {
        await client.connect(); // Connect to the database
        console.log('Successfully connected to the database.');
    } catch (err) {
        console.error('Database connection error:', err.stack);
        throw err; // Rethrow if needed
    }
    return client; // Return the client if you need to use it later
};

module.exports = { createDBClient, connectDB };
