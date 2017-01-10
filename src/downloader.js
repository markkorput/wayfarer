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
        var self = this

        return new Promise((resolve, reject) => {
            var transferStart = new Date();
            progress(request.get(this.url, (err, response, body) => {
                this.transferTime = ((new Date()) - transferStart)/1000.0;

                if(err){
                    reject(err)
                    return
                }

                fs.writeFileSync(this.local_file_path, body)

                this.stats = this.stats || {}

                resolve({local_file_path: this.local_file_path, url: this.url, stats: this.stats, transferTime: this.transferTime})
            }), {})
            .on('progress', (state) => {
                self.stats = state
            })
            .on('error', (err) => {
                reject(err)
            })
        });
    }
}

module.exports = Downloader
