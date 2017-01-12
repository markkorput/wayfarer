const BaseController = require('../../lib/controller');
const facade = require('./facade');
const config = require('config')

// class Controller extends BaseController {
// }

module.exports = new BaseController(facade);
