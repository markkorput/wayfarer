const Controller = require('../../lib/controller');
const pageFacade  = require('./page-facade');

class PageController extends Controller {}

module.exports = new PageController(pageFacade);
