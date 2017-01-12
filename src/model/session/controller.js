const BaseController = require('../../lib/controller');
const facade = require('./facade');
const config = require('config')

class Controller extends BaseController {
    findByIdWithPages(req, res, next) {
        // console.log(req)
        // return res.status(200).json(req.params)
        return this.facade.Model.findById(req.params.id).populate('pages').exec()
        .then(doc => {
            if (!doc) { return res.status(404).end(); }
            return res.status(200).json(doc);
        })
        .catch(err => next(err));
    }
}

module.exports = new Controller(facade);
