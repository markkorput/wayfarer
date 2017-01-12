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

    describe('getGeoData', (done) => {
        describe('getGeoDataServiceUrl', () => {
            it('returns the service url for the page\'s webhost', () => {
                // default value without hostname
                expect((new Page()).getGeoDataServiceUrl()).to.equal('http://freegeoip.net/json/')
                // default value with hostname
                expect((new Page('http://host1.com/page1.html')).getGeoDataServiceUrl()).to.equal('http://freegeoip.net/json/host1.com')
            })
        })

        it('takes a geoDataServiceUrl option with {{host}} macro', () => {
            var page = new Page('http://host2.net/data2.json', {geoDataServiceUrl: 'http://geoservice.io/getgeo?host={{host}}'})
            expect(page.getGeoDataServiceUrl()).to.equal('http://geoservice.io/getgeo?host=host2.net')
        })

        it('retrieves data from an Geoservice API', (done) => {
            // spawn a http-server to test against
            var server = HttpServer.create('./test/fixtures/unit-test-page/');
            var expected = fs.readFileSync('./test/fixtures/unit-test-page/asofterworld.com.geo.json')
            var page = new Page('http://asofterworld.com/rss.xml', {geoDataServiceUrl: 'http://127.0.0.1:'+server.port+'/{{host}}.geo.json'})

            // shortcut so we don't have to perform a download first
            page.getGeoData()
            .then((geoData) => {
                expect(geoData).to.equal(page.geoData)
                expect(geoData).to.deep.equal(JSON.parse(expected))
                done()
            })
            //.catch(done)
            .done((param) => {
                server.destroy()
            });
        })
    })
})
