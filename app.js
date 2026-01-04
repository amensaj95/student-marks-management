const mysql = require('mysql2');
const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'qwerty', 
    database: 'student_db'
});

// Home Route with Search and Statistics 📊
app.get('/', (req, res) => {
    const searchQuery = req.query.search || '';
    
    // SQL to fetch students (filtered by search if provided)
    const listSql = "SELECT * FROM marks WHERE student_name LIKE ?";
    // SQL to calculate Class Average and Count
    const statsSql = "SELECT AVG(score) AS average, COUNT(*) AS total FROM marks";

    db.query(listSql, [`%${searchQuery}%`], (err, students) => {
        if (err) throw err;
        db.query(statsSql, (err, stats) => {
            if (err) throw err;
            res.render('index', { 
                students: students, 
                stats: stats[0],
                searchQuery: searchQuery 
            });
        });
    });
});

// Add/Update Marks Route 📝
app.post('/add-marks', (req, res) => {
    const { student_name, subject, score } = req.body;
    const numericScore = parseInt(score);
    
    let grade = 'F';
    if (numericScore >= 90) grade = 'A';
    else if (numericScore >= 80) grade = 'B';
    else if (numericScore >= 70) grade = 'C';

    const sql = "INSERT INTO marks (student_name, subject, score, grade) VALUES (?, ?, ?, ?)";
    db.query(sql, [student_name, subject, numericScore, grade], (err) => {
        if (err) throw err;
        res.redirect('/');
    });
});

// Delete Route 🗑️
app.get('/delete/:id', (req, res) => {
    db.query("DELETE FROM marks WHERE id = ?", [req.params.id], (err) => {
        if (err) throw err;
        res.redirect('/');
    });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));