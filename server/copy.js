const knex = require('./database');

const bookshelf = require('bookshelf')(knex);

function copyCafe() {
    const query = "copy cafes (uuid, name, city, wifi, seat, quiet, tasty, cheap, music, url, address, limited_time, socket, standing_desk, latitude, longitude, point) from '/Users/simon/Dev/taipei-app/server/test-cafes.csv' delimiters '|' csv header;";
    return knex.raw(query);
}

copyCafe()
    .then((resp) => {
        console.log(resp);
    });
