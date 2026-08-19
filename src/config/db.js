const pg = require('pg');

const pool = new pg.Pool({
    "user": "postgres",
    "database": "engineering",
    "host": "localhost",
    "port": 5432,
    "password": "admin"
});

module.exports = pool;