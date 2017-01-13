const mongoose = require('mongoose');
const PageModel = require('../page/model')

const schema = new mongoose.Schema({
  url:          { type: String, required: true },
  max_visits:   { type: Number, default: 5 },
  pages:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'Page' }]
});

module.exports = mongoose.model('Session', schema);
