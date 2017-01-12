// run an http server to test against
// wayyyy easier than creating stubs for every library involded in the request

const path = require('path')
const fs = require('fs')
const http = require('http')
const http_shutdown = require('http-shutdown');

class HttpServer {
    constructor(local_path, options){
        this.local_path = path.resolve(local_path || './')
        this.options = options || {}
        this.port = this.options.port || 8082
        this.requestCount = 0
    }

    start(){
        this.server = http.createServer((req, res) => {this._onRequest(req, res)})
        // this helps us to (gracefully) shutdown the server at the end of the test
        this.server = http_shutdown(this.server)
        this.server.listen(this.port)
    }

    destroy(){
        if(this.server){
            this.server.shutdown()
            this.server = undefined
        }
    }

    _onRequest(req, res){
        this.requestCount += 1
        const relative_path = req.url.startsWith('/') ? req.url.substring(1) : req.url
        const full_path = path.join(this.local_path, relative_path)

        var response404 = () => {
            // console.log('- 404 - for: ', req.url)
            res.writeHead(404, {'Content-Type': 'text/html'})
            res.end('File Not found')
        }

        // no local file or directory to serve
        if(!fs.existsSync(full_path)){
            // console.warn('doesn\'t exist ('+this.local_path+' / '+req.url+') - 404')
            response404()
            return;
        }

        // it's might be a directory but this simple test server
        // doesn't auto-serve index.html files, only explicit matches
        if(!fs.statSync(full_path).isFile()){
            // console.warn('not a file ('+this.local_path+' / '+req.url+') - 404')
            response404();
            return;
        }

        var html = fs.readFileSync(full_path, 'utf8')
        // console.log('HTTP-server serving content: \n', html)
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html)
    }
}

module.exports = {
    create: (local_path) => {
        var instance = new HttpServer(local_path)
        instance.start()
        return instance;
    }
}
