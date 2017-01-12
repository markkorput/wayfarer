const BaseFacade = require('../../lib/facade');
const PageModel  = require('./model');

class PageFacade extends BaseFacade {
    /**
     * @public
     * @name createFromPageUtil
     *
     * @param {page} a Page object that contains logic to fetch all links
     * on the webpage and fetch geo data about the webhost from a remote API service.
     *
     * @description Create a DB record in the Page collection, then tries to;
     * - get all link urls from the page object and add them to the record,
     * - obtain geo data from a remote service and append it to the record
     */
    createFromPageUtil(page){
        // first create a record in the database with the url and the
        // local cache file (so in the future the local cache can be used)
        return this.create({
            url: page.url,
            cache_file: page.localCacheFile,
        })
        .then(doc => {
            this._addLinks(doc._id, page)
            this._addGeoData(doc._id, page)
        })
        // .catch(err => {
        //     console.warn('createFromPageUtil fialed to create page record in the DB:\n', err)
        // })
    }

    /**
     * @private
     * @name _addLinks
     *
     * @param {_id} Page record id
     * @param {page} a Page object that contains logic to fetch all links
     *
     * @description tries to get all link urls from the page object
     * and saves them to an existing page record in the database.
     */
    _addLinks(_id, page){
        // fetch links from loaded web-page
        page.getLinkUrls()
        .then(link_urls => {
            // add links to existing DB record
            this.Model.findByIdAndUpdate(_id, {hrefs: link_urls})
            .then(doc => {
                console.info('[PageFacade._addLinks] saved links to DB for:', page.url)
            })
            .catch(err => {
                console.warn('[PageFacade._addLinks] failed to save links to DB (for:', page.url, '), err:', err)
            })
        })
        .catch(err => {
            console.warn('[PageFacade._addLinks] failed to fetch links (for:', page.url, '), err:', err)
        })
    }

    /**
     * @private
     * @name _addGeoData
     *
     * @param {_id} Page record id
     * @param {page} a Page object that contains logic to fetch geo-data
     *
     * @description tries to fetch geo-data from a remote API
     * and save it to an existing page record in the database.
     */
    _addGeoData(_id, page){
        // fetch geo data from page's webhost
        page.getGeoData()
        .then(geoData => {
            // save geo data to this page's existing record in the DB
            this.Model.findByIdAndUpdate(_id, {geo_data: geoData})
            .then(doc => {
                console.log('[PageFacade._addGeoData] saved geo-data for: ', page.url)
            })
            .catch(err => {
                console.log('[PageFacade._addGeoData] failed to save geo data to db: ', err)
            })
        })
        .catch(err => {
            console.warn('[PageFacade._addGeoData] failed to fetch geo data (for: ', page.url, '), err:\n', err)
        })
    }
}

module.exports = new PageFacade(PageModel);
