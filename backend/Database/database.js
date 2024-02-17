const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgres://pakingdb_user:rKhWQGO9tECTNnyHguakUtgLK6bdnngK@dpg-cn5hjltjm4es73dnj7n0-a.oregon-postgres.render.com/pakingdb',
    ssl: {
        rejectUnauthorized: false
    }
});

pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log('Connected to PostgresSQL database');

    // Perform database operations here

    release(); // release the client back to the pool
});

module.exports = pool;