const database = require('knex')({
    client:'postgres',
    connection: {
        host : 'localhost',
        user : 'simon',
        password : '*',
        database : 'nyc',
        charset : 'utf8'
    }
});

module.exports = database;
