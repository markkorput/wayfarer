const Nightmare = require('nightmare')
const Promise = require('promise')
const fs = require('fs')

class Page {
    constructor(url, options){
        this.url = url
        this.options = options || {}
        this.nightmare = Nightmare({
            paths: {
                userData: fs.realpathSync('./public/tmp')
            }
        })
    }

    getLinkUrls(){
        return new Promise((resolve, reject) => {
            this.nightmare
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
            const responder = () => {
                if(idx){
                    // they are stored in inverted order
                    return resolve(this.link_urls[this.link_urls.length-1-idx])
                }
                return resolve(this.link_urls[Math.round(Math.random() * this.link_urls.length)])
            }

            if(this.link_urls){
                responder()
            }

            this.getLinkUrls()
            .then(() => {
                responder()
            })
            .catch(reject)
        })
    }
}

module.exports = Page
