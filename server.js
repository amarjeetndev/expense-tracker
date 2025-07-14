// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database file
const DB_FILE = 'database.json';

// Initialize database if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: {}, expenses: {} }));
}

// Helper function to read database
function readDatabase() {
    return JSON.parse(fs.readFileSync(DB_FILE));
}

// Helper function to write to database
function writeDatabase(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// API Routes

// Get all expenses for a user
app.get('/api/expenses/:userId', (req, res) => {
    const db = readDatabase();
    const userId = req.params.userId;
    
    if (!db.expenses[userId]) {
        db.expenses[userId] = {};
    }
    
    res.json(db.expenses[userId]);
});

// Save expense data for a user
app.post('/api/expenses/:userId', (req, res) => {
    const db = readDatabase();
    const userId = req.params.userId;
    const { year, month, data } = req.body;
    
    if (!db.expenses[userId]) {
        db.expenses[userId] = {};
    }
    
    if (!db.expenses[userId][year]) {
        db.expenses[userId][year] = {};
    }
    
    db.expenses[userId][year][month] = data;
    writeDatabase(db);
    
    res.json({ success: true });
});

// Delete expense data for a user
app.delete('/api/expenses/:userId', (req, res) => {
    const db = readDatabase();
    const userId = req.params.userId;
    const { year, month } = req.body;
    
    if (db.expenses[userId] && db.expenses[userId][year] && db.expenses[userId][year][month]) {
        delete db.expenses[userId][year][month];
        writeDatabase(db);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Data not found' });
    }
});

// Admin routes
app.get('/api/admin/users', (req, res) => {
    const db = readDatabase();
    res.json(db.users);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});