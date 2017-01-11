const Router = require('express').Router;
const router = new Router();

const session  = require('./model/session/router');

router.use('/session', session);

router.route('/').get((req, res) => {
  res.json({ message: 'Welcome to wayfarer API!' });
});

module.exports = router;
