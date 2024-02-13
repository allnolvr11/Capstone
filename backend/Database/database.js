const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'caps',
});

db.connect((err) => {
    if (err) {
        console.log('Error connecting to MySql: ', err);
    } else {
        console.log('Connected to MySql');
    }
});

module.exports = db;
