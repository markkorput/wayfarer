const BaseController = require('../../lib/controller');
const facade = require('./facade');
const config = require('config')

class Controller extends BaseController {
    create(req, res, next) {
      var attrs = req.body;

      if(config.util.getEnv('NODE_ENV') == 'development' && !attrs.url){
          attrs = req.query;
          console.warn('[dev-mode] Controller.create; using req.query instead of req.body. Got:\n', attrs)
      }

      this.facade.create(attrs)
      .then(doc => {
          console.log('respondng')
          res.status(201).json(doc)})
      .catch(err => next(err));
    }
}

module.exports = new Controller(facade);
