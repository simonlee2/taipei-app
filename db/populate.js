const http = require('http');
const https = require('https');
const fs = require('fs');
const knex = require('./database');

const getContent = function(options) {
  // return new pending promise
  return new Promise((resolve, reject) => {
    // select http or https module, depending on reqested url
    const lib = options.protocol === ('https:') ? https : http;
    const request = lib.request(options, (response) => {
      // handle http errors
      if (response.statusCode < 200 || response.statusCode > 299) {
         reject(new Error('Failed to load page, status code: ' + response.statusCode));
       }
      // temporary data holder
      const body = [];
      // on every content chunk, push it to the data array
      response.on('data', (chunk) => {
        body.push(chunk)
      });
      // we are done, resolve promise with those joined chunks
      response.on('end', () => {
        resolve(body.join(''))
      });
    });

    // handle connection errors of the request
    request.on('error', (err) => reject(err))
    request.end();
    })
};

const cafeOptions = {
  "protocol": "https:",
  "method": "GET",
  "hostname": "cafenomad.tw",
  "port": 443,
  "path": "/api/v1.2/cafes/taipei",
  "headers": {
    "cache-control": "no-cache",
    "postman-token": "512ba19f-c961-8467-12c8-dea0f372c5b2"
  }
};

const cafeColumns = ['id', 'name', 'city', 'wifi', 'seat', 'quiet', 'tasty', 'cheap', 'music', 'url', 'address', 'limited_time', 'socket', 'standing_desk', 'latitude', 'longitude', 'point'];

function getJSON(options) {
  return getContent(options)
    .then((result) => JSON.parse(result))
    .catch((err) => console.log(err));
};

function maybeToNull(json) {
  json.forEach((entry) => {
      columns.forEach((key) => {
        if (entry[key] === 'maybe') {
          entry[key] = 'NULL';
        }
      });
  });
};

function copyCafe() {
    const query = "copy cafes (uuid, name, city, wifi, seat, quiet, tasty, cheap, music, url, address, limited_time, socket, standing_desk, latitude, longitude, point) from '/Users/simon/Dev/taipei-app/server/cafes.csv' delimiters '\t' csv header;";
    return knex.raw(query);
};

function generatePoint(json) {
  json.forEach((entry) => {
    lat = entry['latitude'];
    long = entry['longitude'];
    entry['point'] = `SRID=4326;Point(${long} ${lat})`;
  })
  return json
}

function toCSV(json, columns, delimiter="\t") {
  output = json.map((entry) => {
      values = columns.map((key) => {
        return entry[key]
      });
      return values.join(delimiter);
    }).join('\n');
  header = ['uuid', 'name', 'city', 'wifi', 'seat', 'quiet', 'tasty', 'cheap', 'music', 'url', 'address', 'limited_time', 'socket', 'standing_desk', 'latitude', 'longitude', 'point']
    .join(delimiter) + '\n';
  return header + output;
};

function writeFilePromise(file, data, options={encoding:'utf8',mode:0o666,flag:'w'}) {
  return new Promise((resolve, reject) => {
      fs.writeFile(file, data, options, (err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
  });
};

getJSON(cafeOptions)
  .then((json) => generatePoint(json))
  .then((json) => toCSV(json, cafeColumns))
  .then((csv) => writeFilePromise('cafes.csv', csv))
  .then(() => copyCafe())
  .then((resp) => {
    console.log(resp);
    knex.destroy();
  })
  .catch((err) => {
    console.log(err);
    knex.destroy();
  });
