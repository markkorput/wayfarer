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
                // .html('./public/html')
                // .pdf('./public/pdf')
                .catch((err) => {
                    // console.error('failed:', err)
                    reject(err)
                })
        })
    }

    getLinks(){
        // return new Promise((resolve, reject){
        //     getLinks
        // })
    }

}

module.exports = Page
