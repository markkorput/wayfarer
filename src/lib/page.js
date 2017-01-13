const Nightmare     = require('nightmare')
const Promise       = require('bluebird')
const fs            = require('fs')
const path          = require('path')
const url           = require('url')
const request       = require('request')

const DEFAULT_GEO_DATA_SERVICE_URL = 'http://freegeoip.net/json/{{host}}'
const DEFAULT_GEO_DATA_SERVICE_TIMEOUT = 2000 // ms; 2 seconds
const DEFAULT_CACHE_FOLDER = './public/pages'

class Page {
    constructor(url, options){
        this.url = url || 'http://'
        this.options = options || {}
    }

    load(){
        var nightmare = Nightmare({
            paths: {
                userData: fs.realpathSync('./public/tmp')
            }
        })

        var load_path = undefined;

        if(this.localCacheFile){
            if(fs.existsSync(this.localCacheFile)){
                load_path = 'file://'+fs.realpathSync(this.localCacheFile)
            } else {
                console.warn('Page.load - this.localCacheFile doesn\'t exist: ', this.localCacheFile)
            }
        }

        const performCache = this.options.cacheFormat != undefined

        if(performCache){
            const timestamp = new Date().toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g, '_')
            this.localCacheFile = path.join(this.options.cacheFolder || DEFAULT_CACHE_FOLDER, timestamp)
        }

        // console.log('Page.getLinkUrls using nightmare to goto url: ', load_path || this.url)
        var result = nightmare
        .goto(load_path || this.url)
        // .html(this.localCacheFile, 'HTMLOnly')
        // .pdf('./public/pdf')
        // .size()

        // https://github.com/electron/electron/blob/master/docs/api/web-contents.md#contentssavepagefullpath-savetype-callback
        // 'HTMLOnly', 'HTMLComplete' or 'MHTML'
        return performCache ? result.html(this.localCacheFile, this.options.cacheFormat) : result
    }

    getLinkUrls(){
        // console.log('getLinkUrls for this.url: ', this.url)
        return new Promise((resolve, reject) => {
            // return cache from previous invocation, if present
            if(this.link_urls){
                resolve(this.link_urls)
            }

            this.load()
            .end()
            .evaluate(() => {
                var count = document.querySelectorAll('a').length - 1
                var hrefs = []
                var link
                while(count >= 0){
                    link = document.querySelectorAll('a')[count]
                    hrefs.push(link.href)
                    count = count -1
                }

                return hrefs
            })
            .then((result) => {
                // console.log('Page.getLinkUrls.nightmare.then, result: ', result)
                this.link_urls = result
                // console.log('yes:', result)
                resolve(result)
            })
            .catch((err) => {
                // console.error('failed:', err)
                reject(err)
            })
        })
    }

    getLinkUrl(idx){
        return new Promise((resolve, reject) => {
            this.getLinkUrls()
            .then((all_urls) => {
                // console.log('getLinkUrl (single) for this.url: ', this.url, ' got urls: ', all_urls, ' and idx: ', idx)
                var picked_url = undefined;

                // pick by index if index is specified
                if(idx){
                    // they are stored in inverted order
                    picked_url = all_urls[all_urls.length-1-idx]
                }

                // pick random
                if(!picked_url){
                    picked_url = all_urls[Math.floor(Math.random() * all_urls.length)]
                }

                // console.log('getLinkUrl (single) picked url:', picked_url)
                if(picked_url){
                    resolve(picked_url)
                    return
                }

                reject(new Error('ENOURL: No URL Found on Page'))
            })
            .catch(reject)
        })
    }

    getGeoDataServiceUrl(){
        return (this.options.geoDataServiceUrl || DEFAULT_GEO_DATA_SERVICE_URL).replace('{{host}}', url.parse(this.url).hostname || '')
    }

    getGeoData(){
        return new Promise((resolve, reject) => {
            // cached from previous call?
            if(this.geoData){
                resolve(this.geoData);
                return
            }

            request.get({
                url: this.getGeoDataServiceUrl(),
                // request takess care of JSON parsing
                json: true,
                timeout: DEFAULT_GEO_DATA_SERVICE_TIMEOUT},
                (err, response, data) => {

                if(err){
                    reject(err)
                    return
                }

                // request lib already parses content to JSON
                this.geoData = data
                resolve(this.geoData)
            })
        })
    }
}

module.exports = Page
