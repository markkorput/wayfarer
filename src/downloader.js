const Promise = require('promise')

class Downloader {
    constructor(url){
        this.url = url;
    }

    download(){
        console.log('todo');
        return new Promise((resolve, reject) => {
            resolve({data: 'foo', url: this.url});
        });
    }
}

module.exports = Downloader
