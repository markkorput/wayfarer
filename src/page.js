const Nightmare = require('nightmare')
const Promise = require('promise')
const fs = require('fs')

class Page {
    constructor(url, options){
        this.url = url
        this.options = options || {}
    }

    getLinkUrls(){
        // console.log('getLinkUrls for this.url: ', this.url)
        return new Promise((resolve, reject) => {
            // return cache from previous invocation, if present
            if(this.link_urls){
                resolve(this.link_urls)
            }

            var nightmare = Nightmare({
                paths: {
                    userData: fs.realpathSync('./public/tmp')
                }
            })

            // console.log('Page.getLinkUrls using nightmare to goto url: ', this.url)
            nightmare
                .goto(this.url)
                // .html('./public/downloads/_html', 'HTMLOnly')
                // .pdf('./public/pdf')
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
