class Session {
    constructor(url, options){
        this.url = url
        this._active = false
    }

    start(){
        this._active = true
    }

    isActive(){
        return this._active
    }
}

module.exports = Session
