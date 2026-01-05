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

db.connect((err) => {
    if (err) {
        console.error('❌ Connection Error:', err.message);
    } else {
        console.log('✅ Connected to MySQL!');
    }
});


app.get('/', (req, res) => {
    const searchQuery = req.query.search || '';
    const gradeFilter = req.query.gradeFilter || '';
    
    let listSql = "SELECT * FROM marks WHERE student_name LIKE ?";
    let params = [`%${searchQuery}%`];

    if (gradeFilter !== '') {
        listSql += " AND grade = ?";
        params.push(gradeFilter);
    }


    const statsSql = "SELECT AVG(score) AS average, COUNT(DISTINCT student_name) AS total FROM marks";

    db.query(listSql, params, (err, students) => {
        if (err) { console.error(err); return res.send("DB Error"); }
        
        db.query(statsSql, (err, stats) => {
            if (err) { console.error(err); return res.send("DB Error"); }
            
            res.render('index', { 
                students: students, 
                stats: stats[0] || { average: 0, total: 0 },
                searchQuery: searchQuery,
                selectedGrade: gradeFilter 
            });
        });
    });
});


app.post('/add-marks', (req, res) => {
    const { student_name, subject, score } = req.body;
    const numericScore = parseInt(score);
    
    let grade = 'F';
    if (numericScore >= 90) grade = 'A';
    else if (numericScore >= 80) grade = 'B';
    else if (numericScore >= 70) grade = 'C';
    else if (numericScore >= 60) grade = 'D';

    const sql = "INSERT INTO marks (student_name, subject, score, grade) VALUES (?, ?, ?, ?)";
    db.query(sql, [student_name, subject, numericScore, grade], (err) => {
        if (err) throw err;
        res.redirect('/');
    });
});


app.get('/delete/:id', (req, res) => {
    db.query("DELETE FROM marks WHERE id = ?", [req.params.id], (err) => {
        if (err) throw err;
        res.redirect('/');
    });
});

app.listen(3000, () => console.log('🚀 Server running on http://localhost:3000'));