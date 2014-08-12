
//TODO: Make schema definition JSON declarative
var models = function(schema) {
  var Song = schema.define('Song', {
      path:         { type: String },
      filename:     { type: String },
      artist:       { type: String },
      title:        { type: String },
      displayname:  { type: String },
      lyrics:       { type: String }
  });


  var Singer = schema.define('Singer', {
      order:        { type: Number },
      name:         { type: String }
  });

  // setup relationships
  Singer.belongsTo(Song,   { as: 'singer', foreignKey: "songId" } );

  models.schema = schema;
  models.Song = Song;
  models.Singer = Singer;

}

module.exports = models;