const Promise       = require('promise')
const Page          = require('./page')
const EventEmitter  = require('events')

class Session extends EventEmitter {
    constructor(url, options){
        super()
        this.url = url
        this.options = options || {}
        this._active = false
        this.maxVisits = this.options.maxVisits || 5
        this.pages = []
        this._complete = false
    }

    start(){
        return new Promise((resolve, reject) => {
            var iteration = (next_url) => {
                // console.log('iteration, visits done: '+this.pages.length+', nexturl: '+next_url)

                if(this.pages.length >= this.maxVisits){
                    console.info('session done with ' + this.maxVisits + ' sessions')
                    this._complete = true
                    this._active = false
                    resolve(this)
                    return
                }

                var page = new Page(next_url, this.options.pageOptions || {})
                this.pages.push(page)

                page.getLinkUrl() // random link url from page
                .then((found_url) => {
                    this.emit('page', this, page)
                    // recursive call to self
                    iteration(found_url)
                })
                .catch((err) => {
                    // TODO; try another link on the previous page
                    if(err.message.startsWith('ENOURL')){
                        this._active = false;
                        resolve(this);
                        return
                    }

                    reject(err)
                })
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

    isComplete(){
        return this._complete
    }
}

module.exports = Session
