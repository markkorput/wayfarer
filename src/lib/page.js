const Nightmare = require('nightmare')
const Promise   = require('promise')
const fs        = require('fs')
const path      = require('path')

class Page {
    constructor(url, options){
        this.url = url
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
            this.localCacheFile = path.join(this.options.cacheFolder || './public/downloads', timestamp)
        }

        // console.log('Page.getLinkUrls using nightmare to goto url: ', load_path || this.url)
        var result = nightmare
        .goto(load_path || this.url)
        // .html(this.localCacheFile, 'HTMLOnly')
        // .pdf('./public/pdf')
        // .size()

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
}

module.exports = Page
