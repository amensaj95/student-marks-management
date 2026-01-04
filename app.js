const mysql = require('mysql2');
const express = require('express');
const app = express();

// 1. Settings ⚙️
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// 2. Database Connection 🔌
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'qwerty', // ⚠️ Remember to use your actual password
    database: 'student_db'
});

db.connect((err) => {
    if (err) {
        console.error('Connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to the MySQL server! 🚀');
});

// 3. Routes 🛣️

// Home Route: Fetches and displays all students
app.get('/', (req, res) => {
    const sql = 'SELECT * FROM marks';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.render('index', { students: results });
    });
});

// Add Marks Route: Handles calculation and database insertion
app.post('/add-marks', (req, res) => {
    const { student_name, subject, score } = req.body;
    const numericScore = parseInt(score);
    
    // Grading Logic 📝
    let grade = 'F';
    if (numericScore >= 90) grade = 'A';
    else if (numericScore >= 80) grade = 'B';
    else if (numericScore >= 70) grade = 'C';
    else if (numericScore >= 60) grade = 'D';

    const sql = 'INSERT INTO marks (student_name, subject, score, grade) VALUES (?, ?, ?, ?)';
    db.query(sql, [student_name, subject, numericScore, grade], (err) => {
        if (err) throw err;
        res.redirect('/'); 
    });
});

// Delete Route: Removes a specific student by their ID
app.get('/delete/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM marks WHERE id = ?';
    db.query(sql, [id], (err) => {
        if (err) throw err;
        res.redirect('/');
    });
});

// 4. Start Server 🟢
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});