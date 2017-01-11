const http = require('http')
const http_shutdown = require('http-shutdown');
const fs = require('fs')

import Session from '../../src/session';

describe('Session', () => {
    describe('constructor', () => {
        it('takes a url', () => {
            expect((new Session('http://www.xkcd.com')).url).to.equal('http://www.xkcd.com')
        })
    })

    describe('start', function(){
        this.timeout(8000)

        it('trigges the async process of fetching web-pages and following links', (done) => {
            var port = 8082
            var session = new Session('http://127.0.0.1:'+port+'/page1');

            // run an http server to test against (wayyyy easier than creating stubs)
            // for every library involded in the request
            var server = http.createServer(function (req, res) {
                const relative_path = './test/fixtures/unit-test-session'+req.url+'.html'
                if(!fs.statSync(relative_path).isFile()){
                    // console.log('- 404 - for: ', req.url)
                    res.writeHead(404, {'Content-Type': 'text/html'})
                    res.write('File Not found')
                    res.end()
                    return
                }

                var html = '';
                html = fs.readFileSync(relative_path, 'utf8')
                // console.log(html)
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(html)
                res.end()
            });

            // this helps us to (gracefully) shutdown the server at the end of the test
            server = http_shutdown(server)
            server.listen(port)

            // BEFORE
            expect(session.isActive()).to.be.false
            expect(session._maxVisits).to.equal(5) // default

            // Call start and hookup promise callbacks
            session.start()
            .then((session) => {
                expect(session.pages.length).to.equal(session._maxVisits)
                done()
            })
            .catch(done)
            // without the following line, failed expects in the 'then' callback wouldn't fail the test
            .done(() => {
                server.shutdown()
            })

            // AFTER
            expect(session.isActive()).to.be.true
        })

        it('')
    })
})
