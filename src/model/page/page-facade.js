const Model = require('../../lib/facade');
const pageSchema  = require('./page-schema');

class PageModel extends Model {}

module.exports = new PageModel(pageSchema);
