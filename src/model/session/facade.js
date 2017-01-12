const BaseFacade    = require('../../lib/facade');
const SessionModel  = require('./model');
const pageFacade    = require('../page/facade')
const BrowsingSession = require('../../lib/session')

class SessionFacade extends BaseFacade {
    /**
     * @public
     * @name create
     *
     * @param {data} attributes object to populate the new DB record with
     *
     * @description creates a database record with the provided attribute values,
     * and then initiates a browsing session which generates page-visits of which
     * metadata is also recorded into the database
     */
    create(data){
        // create like our default BaseFacade
        return super.create(data)
        // after successfull create
        .then((session_doc) => {
            // we're gonna run a browsing session
            var browsing_session = new BrowsingSession(session_doc.url, {pageOptions: {cacheFormat: 'HTMLComplete'}});
            // every time a page is loaded during the browsing session
            browsing_session.on('page', (session, page) => {
                // let the page facade create a document for it in the DB
                pageFacade.createFromPageUtil(page)
                .then((page_doc) => {
                    this._addPageId(session_doc._id, page_doc._id)
                })
                .catch(err => {
                    console.log('[SessionFacade.create] failed to create page record (for: ',page.url,'), err: ', err)
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

    /**
     * @private
     * @name _addPageId
     *
     * @param {session_id} id of the session record to add the page-ID to
     * @param {page_id} id of the page record to add to the specified session
     */
    _addPageId(session_id, page_id){
        // add the page document's _id to our session doc's `pages` array
        return this.Model.findByIdAndUpdate(session_id, {
            $push: {"pages": page_id}
        })
        .then(session_page_doc => {
            console.log('[SessionFacade._addPageId] added page-id to session record')
        })
        .catch(err => {
            console.log('[SessionFacade._addPageId] failed to add page-id to session record')
        })
    }
}

module.exports = new SessionFacade(SessionModel);
