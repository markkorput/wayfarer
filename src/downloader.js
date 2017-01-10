const fs = require('fs')
const Promise = require('promise')
const request = require('request')
const progress = require('request-progress')

const DEFAULT_GEO_DATA_SERVICE_URL = 'http://freegeoip.net/json/'
const DEFAULT_GEO_DATA_SERVICE_TIMEOUT = 2000 // ms; 2 seconds

class Downloader {
    constructor(url, options){
        this.url = url
        this.options = options || {}
        this.folder = this.options.folder || './public/downloads/'
        if(!this.folder.endsWith('/')){
            this.folder = this.folder + '/'
        }
        this.geoDataServiceUrl = this.options.geoDataServiceUrl || DEFAULT_GEO_DATA_SERVICE_URL
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

                this._hostname = response.request.uri.hostname
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

    setGeoDataServiceUrl(url){
        this.geoDataServiceUrl = url
    }

    getGeoDataServiceUrl(){
        return this._hostname ? this.geoDataServiceUrl.replace('{{host}}', this.hostname) : this.getGeoDataServiceUrl
    }

    getGeoData(){
        return new Promise((resolve, reject) => {
            if(!this._hostname){
                reject(new Error('No hostname available for getGeoData operations'))
                return
            }

            request.get({
                url: this.getGeoDataServiceUrl(),
                // request takess care of JSON parsing
                json: true,
                timeout: DEFAULT_GEO_DATA_SERVICE_TIMEOUT},
                (err, response, data) => {

                if(err){
                    reject(err)
                    return
                }

                this.geoData = data //JSON.parse(data)
                resolve(this.geoData)
            })
        })
    }
}

module.exports = Downloader
