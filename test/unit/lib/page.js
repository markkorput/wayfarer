const fs    = require('fs')
const app   = require('../../../src/app')
const Page  = require('../../../src/lib/page')

// make sure our HTTP service is running before running the test cases
before((done) => { app.start(done) })

describe('page', () => {
    describe('load', function(){
        this.timeout(4000 * timeout_multiply)

        it('downloads an external resource and saves local cache files if the cacheFormat options is specified', (done) => {
            // create a page instance with an url that points to the website served by our http server
            var page = new Page('http://localhost:'+app.port+'/fixtures/unit-page/xkcd.com.html', {cacheFormat: 'HTMLOnly'})

            expect(page.localCacheFile).to.equal(undefined)

            page.load(true)
            .end()
            .then(() => {
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
        this.timeout(4000 * timeout_multiply)

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
        this.timeout(4000 * timeout_multiply)

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

    describe('getGeoDataServiceUrl', () => {
        it('returns the service url for the page\'s webhost', () => {
            // default value without hostname
            expect((new Page()).getGeoDataServiceUrl()).to.equal('http://freegeoip.net/json/')
            // default value with hostname
            expect((new Page('http://host1.com/page1.html')).getGeoDataServiceUrl()).to.equal('http://freegeoip.net/json/host1.com')
        })
    })

    describe('getGeoData', (done) => {
        it('uses the geoDataServiceUrl option with {{host}} macro', () => {
            var page = new Page('http://host2.net/data2.json', {geoDataServiceUrl: 'http://geoservice.io/getgeo?host={{host}}'})
            expect(page.getGeoDataServiceUrl()).to.equal('http://geoservice.io/getgeo?host=host2.net')
        })

        it('retrieves data from an Geoservice API', (done) => {
            var expected = fs.readFileSync('./public/fixtures/unit-page/asofterworld.com.geo.json')
            var page = new Page('http://asofterworld.com/rss.xml', {geoDataServiceUrl: 'http://127.0.0.1:'+app.port+'/fixtures/unit-page/{{host}}.geo.json'})

            // shortcut so we don't have to perform a download first
            page.getGeoData()
            .then((geoData) => {
                expect(geoData).to.equal(page.geoData)
                expect(geoData).to.deep.equal(JSON.parse(expected))
                done()
            })
            .catch(done)
        })
    })
})
