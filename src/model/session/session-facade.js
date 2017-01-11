const Model = require('../../lib/facade');
const sessionSchema  = require('./session-schema');

class SessionModel extends Model {}

module.exports = new SessionModel(sessionSchema);
