const fs = require('fs')
import Page from '../../src/page';


describe('page', () => {
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
