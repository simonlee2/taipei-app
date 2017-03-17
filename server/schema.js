const Schema = {
  cafes: {
    id: {type: 'increments', nullable: false},
    uuid: {type: 'string', maxlength: 36, nullable: false, unique: true},
    name: {type: 'string', maxlength: 50, nullable: false},
    city: {type: 'string', maxlength: 12, nullable: false},
    wifi: {type: 'integer', unsigned: true},
    seat: {type: 'integer', unsigned: true},
    quiet: {type: 'integer', unsigned: true},
    tasty: {type: 'integer', unsigned: true},
    cheap: {type: 'integer', unsigned: true},
    music: {type: 'integer', unsigned: true},
    url: {type: 'string', maxlength: 2048},
    address: {type: 'string', maxlength: 2048},
    limited_time: {type: 'boolean'},
    socket: {type: 'boolean'},
    standing_desk: {type: 'boolean', nullable: false},
    latitude: {type: 'decimal'},
    longtitude: {type: 'decimal'},
    geom: {type: 'geometry'}
  }
};

module.exports = Schema;
