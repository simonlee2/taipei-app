const database = require('knex')({
    client:'postgres',
    connection: {
        host : 'db',
        user : 'simon',
        password : 'secret',
        database : 'nyc',
        charset : 'utf8'
    }
});

module.exports = database;
