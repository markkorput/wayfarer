const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  url:   { type: String, required: true },
  cache_file: { type: String },
  hrefs: [ String ]
});

const schema = new mongoose.Schema({
  url:   { type: String, required: true },
  pages: [ pageSchema ]
});

module.exports = mongoose.model('Session', schema);
