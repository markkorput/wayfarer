const fs = require('fs')
import Page from '../../../src/lib/page';
import HttpServer from '../../lib/http_server';

describe('page', () => {
    describe('load', function(){
        this.timeout(4000)

        it('downloads an external resource and saves local cache files if the cacheFormat options is specified', (done) => {
            // start http server that serves example website
            var server = HttpServer.create('./test/fixtures/unit-test-page/');
            // create a page instance with an url that points to the website served our http server
            var page = new Page('http://localhost:'+server.port+'/xkcd.com.html', {cacheFormat: 'HTMLOnly'})

            expect(server.requestCount).to.equal(0)
            expect(page.localCacheFile).to.equal(undefined)

            page.load(true)
            .end(() => {
                server.destroy()
            })
            .then(() => {
                expect(server.requestCount).to.be.above(0)
                expect(page.localCacheFile).to.not.equal(undefined)
                expect(fs.existsSync(page.localCacheFile)).to.be.true
                // cleanup
                fs.unlinkSync(page.localCacheFile)
                done()
            })
            .catch((err) => {
                console.log('err: ', err)
                done()
            })
        })
    })

    // function() notation instead of arrow ( => ) ontation required, otherwise 'this'
    // will not be available inside the handler
    describe('getLinkUrls', function(){
        this.timeout(4000); // 3.5 seconds; give the nightmare lib some time to fetch the page

        it('should return the urls of all the links on the page', (done) => {
            // var page = new Page('http://asofterworld.com')
            var page = new Page('file://' + fs.realpathSync('./test/fixtures/asofterworld.com.html'))

            page.getLinkUrls()
            .then((urls) => {
                expect(urls).to.equal(page.link_urls)
                expect(urls.length).to.equal(39)
                done()
            })
            // without the following line, failed expects in the 'then' callback wouldn't fail the test
            .done(() => {})
        })
    })

    describe('getLinkUrl', function(){
        this.timeout(4000); // 3.5 seconds; give the nightmare lib some time to fetch the page

        it('should return a random url from the page', (done) => {
            // var page = new Page('http://asofterworld.com')
            var page = new Page('file://' + fs.realpathSync('./test/fixtures/asofterworld.com.html'))

            page.getLinkUrl()
            .then((url) => {
                expect(page.link_urls).to.include(url)
                done()
            })
            // without the following line, failed expects in the 'then' callback wouldn't fail the test
            .done(() => {})
        })

        it('should return an url by index from the page', (done) => {
            // var page = new Page('http://asofterworld.com')
            var page = new Page('file://' + fs.realpathSync('./test/fixtures/asofterworld.com.html'))

            page.getLinkUrl(1)
            .then((url) => {
                expect(page.link_urls).to.include(url)
                expect(url).to.equal('http://www.asofterworld.com/archive.php')
                done()
            })
            // without the following line, failed expects in the 'then' callback wouldn't fail the test
            .done(() => {})
        })
    })
})
