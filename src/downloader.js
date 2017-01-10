const fs = require('fs')
const Promise = require('promise')
const request = require('request')
const progress = require('request-progress')

class Downloader {
    constructor(url, options){
        this.url = url
        this.options = options || {}
        this.folder = this.options.folder || './public/downloads/'
        if(!this.folder.endsWith('/')){
            this.folder = this.folder + '/'
        }
    }

    download(){
        var timestamp = new Date().toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g, '_')
        this.local_file_path = this.folder + timestamp

        return new Promise((resolve, reject) => {
            progress(request.get(this.url), {})
            .on('progress', (state) => {
                this.stats = state
            })
            .on('error', (err) => {
                reject(err)
            })
            .on('end', () => {
                resolve({local_file_path: this.local_file_path, url: this.url, stats: this.stats})
            })
            .pipe(fs.createWriteStream(local_file_path))
        });
    }
}

module.exports = Downloader
