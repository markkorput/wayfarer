const BaseFacade = require('../../lib/facade');
const SessionModel  = require('./model');

const BrowsingSession = require('../../lib/session')

class SessionFacade extends BaseFacade {

    create(input){
        // create like normal REST resource
        return super.create(input)
        // after successfull create
        .then((session_doc) => {
            // initiate browsing session
            var browsing_session = new BrowsingSession(session_doc.url, {pageOptions: {cacheFormat: 'HTMLComplete'}});
            // every time a page is loaded
            browsing_session.on('page', (session, page) => {
                // console.log('loaded page: ', page)

                // add it to the DB
                page.getLinkUrls()
                .then(link_urls => {
                    this.Model.findByIdAndUpdate(
                        session_doc._id,
                        {$push: {"pages": {
                            url: page.url,
                            cache_file: page.localCacheFile,
                            hrefs: link_urls}}})
                    .then(page_doc => {
                        console.info('recorded page:', page_doc.url)

                        // fetch geo data
                        page.getGeoData()
                        .then(geoData => {
                            // save geo data to this page's record inside the session document
                            this.Model.update(
                                { _id: session_doc._id, "pages._id": page_doc._id},
                                { $set: {"pages.$.geo_data": geoData }})
                            .then(geo_doc => {
                                console.log('recorded geo data for ', page.url, ' with: ', geoData, ' \n\ndoc: ', geo_doc)
                            })
                            .catch(err => {
                                console.log('failed to save geo data to db: ', err)
                            })
                        })
                        .catch(err => {
                            console.warn('failed to fetch geo data for page with url '+page.url+', err:\n', err)
                        })
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
