const Controller = require('../../lib/controller');
const sessionFacade  = require('./session-facade');

class SessionController extends Controller {}

module.exports = new SessionController(sessionFacade);
