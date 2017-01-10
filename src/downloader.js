const fs = require('fs')
const Promise = require('promise')
const mkdirp = require('mkdirp')
const request = require('request')

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
        return new Promise((resolve, reject) => {
            request.get(this.url, (err, response, body) => {
                if(err){
                    reject(err);
                    return;
                }

                // resolve(body)
                mkdirp(this.folder, (err) => {
                    if(err){
                        reject(err);
                        return;
                    }

                    var timestamp = new Date().toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g, '_')
                    var local_file_path = this.folder + timestamp
                    fs.writeFileSync(local_file_path, body, 'utf8')
                    resolve({local_file_path: local_file_path, url: this.url})
                });
            });
        });
    }
}

module.exports = Downloader
