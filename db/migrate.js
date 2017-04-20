var knex = require('./database');
var Schema = require('./schema');

function createTable(tableName) {
  console.log("Creating table: " + tableName);
  return knex.schema.createTable(tableName, function (table) {
    var column;
    var columnKeys = Object.keys(Schema[tableName]);
    columnKeys.forEach((key) => {
      if (Schema[tableName][key].type === 'text' && Schema[tableName][key].hasOwnProperty('fieldtype')) {
        column = table[Schema[tableName][key].type](key, Schema[tableName][key].fieldtype);
      }
      else if (Schema[tableName][key].type === 'string' && Schema[tableName][key].hasOwnProperty('maxlength')) {
        column = table[Schema[tableName][key].type](key, Schema[tableName][key].maxlength);
      }
      else if (Schema[tableName][key].type === 'geometry') {
        column = table.specificType('point', 'geometry(point, 4326)');
      }
      else {
        column = table[Schema[tableName][key].type](key);
      }
      if (Schema[tableName][key].hasOwnProperty('nullable') && Schema[tableName][key].nullable === true) {
        column.nullable();
      }
      else {
        column.notNullable();
      }
      if (Schema[tableName][key].hasOwnProperty('primary') && Schema[tableName][key].primary === true) {
        column.primary();
      }
      if (Schema[tableName][key].hasOwnProperty('unique') && Schema[tableName][key].unique) {
        column.unique();
      }
      if (Schema[tableName][key].hasOwnProperty('unsigned') && Schema[tableName][key].unsigned) {
        column.unsigned();
      }
      if (Schema[tableName][key].hasOwnProperty('references')) {
        column.references(Schema[tableName][key].references);
      }
      if (Schema[tableName][key].hasOwnProperty('defaultTo')) {
        column.defaultTo(Schema[tableName][key].defaultTo);
      }
    });
  });
}

function createTables () {
  var tables = [];
  var tableNames = Object.keys(Schema);
  console.log(tableNames);
  tables = tableNames.map((tableName) => {
    return createTable(tableName);
  });
  return Promise.all(tables);
}

createTables()
.then(function() {
  console.log('Tables created!!');
  process.exit(0);
})
.catch(function (error) {
  throw error;
});
