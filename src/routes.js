const Router = require('express').Router;
const router = new Router();

const session  = require('./model/session/session-router');
const page  = require('./model/page/page-router');


router.route('/').get((req, res) => {
  res.json({ message: 'Welcome to wayfarer API!' });
});

router.use('/session', session);
router.use('/page', page);


module.exports = router;
