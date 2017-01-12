const BaseFacade = require('../../lib/facade');
const SessionModel  = require('./model');

const BrowsingSession = require('../../lib/session')

class SessionFacade extends BaseFacade {

    create(input){
        // create like normal REST resource
        return super.create(input)
        // after successfull create
        .then((doc) => {
            // initiate browsing session
            var browsing_session = new BrowsingSession(doc.url, {pageOptions: {cacheFormat: 'HTMLComplete'}});
            // every time a page is loaded
            browsing_session.on('page', (session, page) => {
                // console.log('loaded page: ', page)

                // add it to the DB
                page.getLinkUrls()
                .then(link_urls => {
                    this.Model.findByIdAndUpdate(
                        doc._id,
                        {$push: {"pages": {
                            url: page.url,
                            cache_file: page.localCacheFile,
                            hrefs: link_urls}}})
                    .then(doc => {
                        console.info('recorded page:', doc.url)
                    })
                    .catch(err => {
                        console.warn('failed to add page to db record, err: ', err)
                    })
                })
                .catch(err => {
                    console.warn('failed to getLinkUrls for page with url: ', page.url)
                })
            })

            browsing_session.start()
        })
    }
}

module.exports = new SessionFacade(SessionModel);
