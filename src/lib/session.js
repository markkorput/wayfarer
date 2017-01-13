const Promise       = require('bluebird')
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
            // cached results form earlier invocation?
            if(this.pages.length >= this.maxVisits){
                resolve(this)
                return
            }

            // visit callback; takes a url, tries to fetch the page
            const visit = (next_url) => {
                return new Promise((visit_resolve, visit_reject) => {
                    var page = new Page(next_url, this.options.pageOptions || {})

                    page.load()
                    .then(result => {
                        // resolve with self and found found page
                        visit_resolve(page)
                    })
                    .catch(visit_reject)
                })
            }

            // iteration callback; aborts if session is complete,
            // otherwise tries to do another visit
            const iteration = (next_url) => {
                // visit next url
                visit(next_url)
                .then((page) => {
                    // save the fetched page
                    this.pages.push(page)
                    this.emit('page', this, page)

                    if(this.pages.length >= this.maxVisits){
                        this._complete = true
                        this._active = false
                        resolve(this)
                        console.info('session complete with ' + this.pages.length + ' page-visits')
                        return
                    }

                    // try to find link on new page, if found
                    // return it to our caller
                    page.getLinkUrl()
                    .then(link_url => {
                        iteration(link_url)
                    })
                    .catch(err => {
                        if(err.message && err.message.startsWith('ENOURL')){
                            // resolve; we couldn't complete,
                            // but we didn't run into 'real' errors
                            this._active = false
                            resolve(this)
                            console.info('session finished incomplete with ' + this.pages.length + ' page-visits')
                            return
                        }

                        reject(err)
                    })
                }).catch(reject)
            }

            this._active = true
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
