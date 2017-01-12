const BaseFacade    = require('../../lib/facade');
const SessionModel  = require('./model');
const pageFacade    = require('../page/facade')
const BrowsingSession = require('../../lib/session')

class SessionFacade extends BaseFacade {
    create(input){
        // create like normal REST resource
        return super.create(input)
        // after successfull create
        .then((session_doc) => {
            // initiate browsing session
            var browsing_session = new BrowsingSession(session_doc.url, {pageOptions: {cacheFormat: 'HTMLComplete'}});

            // every time a page is loaded during the browsing session
            browsing_session.on('page', (session, page) => {
                // let the page facade create a Page document in the DB
                pageFacade.createFromPageUtil(page, (page_doc) => {
                    this.Model.findByIdAndUpdate(session_doc._id, {
                        $push: {"pages": page_doc._id}
                    })
                    .then(session_page_doc => {
                        console.log('[SessionFacade.create] added page-id to session record')
                    })
                    .catch(err => {
                        console.log('[SessionFacade.create] faield to add page-id to session record')
                    })
                })
            })

            // initiate browsing session
            browsing_session.start()
            .done(() => {
                console.info('[SessionFacade.create] browsing session ended')
            })
            .catch(err => {
                console.warn('[SessionFacade.create] browsing session errored: ', err)
            })
        })
    }
}

module.exports = new SessionFacade(SessionModel);
