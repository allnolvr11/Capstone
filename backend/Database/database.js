const { Pool } = require('pg');

const db = new Pool({
    host: 'dpg-cn5hjltjm4es73dnj7n0-a',
    port: 5432,
    user: 'pakingdb_user',
    password: 'rKhWQG09+ECTNyHguajkUtgLk6bdhnqK',
    database: 'pakingdb',
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to PostgreSQL:', err);
    } else {
        console.log('Connected to PostgreSQL');
    }
});

module.exports = db;