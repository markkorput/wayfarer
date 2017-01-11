const Promise = require('promise')
import Page from './page';

class Session {
    constructor(url, options){
        this.url = url
        this._active = false
        this._maxVisits = 5
        this.pages = []
    }

    start(){
        return new Promise((resolve, reject) => {
            var iteration = (next_url) => {
                // console.log('iteration, visits done: '+this.pages.length+', nexturl: '+next_url)

                if(this.pages.length >= this._maxVisits){
                    console.info('session done with ' + this._maxVisits + ' sessions')
                    this._active = false
                    resolve(this)
                    return
                }

                var page = new Page(next_url)
                page.getLinkUrl() // random link url from page
                .then((found_url) => {
                    this.pages.push(page)
                    // recursive call to self
                    iteration(found_url)
                })
                .catch(reject)
            }

            this._active = true

            // iteration will recursively call itself
            // until the session is complete
            // TODO will this scale with longer sessions?
            iteration(this.url)
        })
    }

    isActive(){
        return this._active
    }
}

module.exports = Session
