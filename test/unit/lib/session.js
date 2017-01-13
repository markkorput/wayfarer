const app   = require('../../../src/app')
const Page  = require('../../../src/lib/page')

import Session from '../../../src/lib/session';

// make sure our HTTP service is running before running the test cases
before((done) => { app.start(done) })

describe('Session', () => {
    describe('constructor', () => {
        it('takes a url', () => {
            expect((new Session('http://www.xkcd.com')).url).to.equal('http://www.xkcd.com')
        })
    })

    describe('start', function(){
        this.timeout(15000)

        it('triggers the async process of fetching web-pages and following links', (done) => {
            var amount = 2
            var session = new Session('http://127.0.0.1:'+app.port+'/fixtures/unit-session/page1.html', {maxVisits: amount});

            var pageCounter = 0
            session.on('page', (session, page) => {
                pageCounter += 1
            })

            // BEFORE
            expect(session.isActive()).to.be.false

            // Call start and hookup promise callbacks
            session.start()
            .then((session) => {
                expect(session.pages.length).to.equal(session.maxVisits)
                expect(session.maxVisits).to.equal(amount) // default
                expect(session.isActive()).to.be.false
                expect(session.isComplete()).to.be.true
                expect(pageCounter).to.equal(amount)
                done()
            })
            .catch(done)

            // AFTER
            expect(session.isActive()).to.be.true
        })

        it('fails to reach maxVisits gracefully', (done) => {
            var session = new Session('http://127.0.0.1:'+app.port+'/fixtures/unit-session/fail1.html');

            // BEFORE
            expect(session.isActive()).to.be.false
            expect(session.maxVisits).to.equal(5)

            // Call start and hookup promise callbacks
            session.start()
            .then((session) => {
                // only two; second page didn't have any links
                expect(session.pages.length).to.equal(2)
                expect(session.isActive()).to.be.false
                expect(session.isComplete()).to.be.false
                done()
            })
            .catch(done)

            // AFTER
            expect(session.isActive()).to.be.true
        })
    })

    describe('pageOptions options', () => {
        it('should pass it on to all Page instances it creates');
    })

    describe('maxVisits option', () => {
        it('lets the owner specify how many visit to perform during the session', () => {
            // default
            expect(new Session('url').maxVisits).to.eql(5)
            // overwritten using maxVisits option
            expect(new Session('url', {maxVisits: 123}).maxVisits).to.eql(123);
        })
    })
})
