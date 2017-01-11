const BaseFacade = require('../../lib/facade');
const SessionModel  = require('./model');

const BrowsingSession = require('../../lib/session')

class SessionFacade extends BaseFacade {

    create(input){
        // create like normal REST resource
        return super.create(input)
        // after successfull create, initiate browsing session
        .then((doc) => {
            (new BrowsingSession(doc.url)).start()
        })
    }
}

module.exports = new SessionFacade(SessionModel);
