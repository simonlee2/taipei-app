const Schema = {
  cafes: {
    id: {type: 'increments', nullable: false},
    uuid: {type: 'string', maxlength: 36, nullable: false, unique: true},
    name: {type: 'string', maxlength: 50, nullable: false},
    city: {type: 'string', maxlength: 12, nullable: false},
    wifi: {type: 'decimal', nullable: true},
    seat: {type: 'decimal', nullable: true},
    quiet: {type: 'decimal', nullable: true},
    tasty: {type: 'decimal', nullable: true},
    cheap: {type: 'decimal', nullable: true},
    music: {type: 'decimal', nullable: true},
    url: {type: 'string', maxlength: 2048, nullable: true},
    address: {type: 'string', maxlength: 2048, nullable: true},
    limited_time: {type: 'string', nullable: true},
    socket: {type: 'string', nullable: true},
    standing_desk: {type: 'string', nullable: true},
    latitude: {type: 'decimal'},
    longitude: {type: 'decimal'},
    geom: {type: 'geometry'}
  }
};

module.exports = Schema;
