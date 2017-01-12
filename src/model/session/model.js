const mongoose = require('mongoose');

// based on freegeoip.net json format
const geoDataScheme = new mongoose.Schema({
    ip:             { type: String }, // ie. "67.205.11.55"
    country_code:   { type: String }, // ie. "US"
    country_name:   { type: String }, // ie. "United States"
    region_code:    { type: String }, // ie. "CA"
    region_name:    { type: String }, // ie. "California"
    city:           { type: String }, // ie. "Brea"
    zip_code:       { type: String }, // ie. "92821"
    time_zone:      { type: String }, // ie. "America/Los_Angeles"
    latitude:       { type: Number }, // ie. 33.9269
    longitude:      { type: Number }, // ie. -117.8612
    metro_code:     { type: Number }  // ie. 803
})

const pageSchema = new mongoose.Schema({
  url:   { type: String, required: true },
  cache_file: { type: String },
  hrefs: [ String ],
  geo_data: { type: geoDataScheme }
});

const schema = new mongoose.Schema({
  url:   { type: String, required: true },
  pages: [ pageSchema ]
});

module.exports = mongoose.model('Session', schema);
