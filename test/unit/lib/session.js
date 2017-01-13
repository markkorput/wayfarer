import HttpServer from '../../lib/http_server';
import Session from '../../../src/lib/session';

describe('Session', () => {
    describe('constructor', () => {
        it('takes a url', () => {
            expect((new Session('http://www.xkcd.com')).url).to.equal('http://www.xkcd.com')
        })
    })

    describe('start', function(){
        this.timeout(10000)

        it('triggers the async process of fetching web-pages and following links', (done) => {
            var server = HttpServer.create('./test/fixtures/unit-test-session/');
            var session = new Session('http://127.0.0.1:'+server.port+'/page1.html');
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
                expect(session.maxVisits).to.equal(5) // default
                expect(session.isActive()).to.be.false
                expect(session.isComplete()).to.be.true
                expect(pageCounter).to.equal(5)
                done()
            })
            .catch(done)
            // without the following line, failed expects in the 'then' callback wouldn't fail the test
            .done(() => {
                server.destroy()
            })

            // AFTER
            expect(session.isActive()).to.be.true
        })

        it('fails to reach maxVisits gracefully', (done) => {
            var server = HttpServer.create('./test/fixtures/unit-test-session/');
            var session = new Session('http://127.0.0.1:'+server.port+'/fail1.html');

            // BEFORE
            expect(session.isActive()).to.be.false
            expect(session.maxVisits).to.equal(5)

            // Call start and hookup promise callbacks
            session.start()
            .then((session) => {
                expect(session.pages.length).to.equal(2)
                expect(session.isActive()).to.be.false
                expect(session.isComplete()).to.be.false
                done()
            })
            .catch(done)
            // without the following line, failed expects in the 'then' callback wouldn't fail the test
            .done(() => {
                server.destroy()
            })

            // AFTER
            expect(session.isActive()).to.be.true
        })

        describe('maxVisits option', () => {
            it('lets the owner specify how many visit to perform during the session', () => {
                expect(new Session('url', {maxVisits: 123}).maxVisits).to.eql(123);
            })

            it('should only perform the specified number of visits', (done) => {
                var server = HttpServer.create('./test/fixtures/unit-test-session/');
                var session = new Session('http://127.0.0.1:'+server.port+'/page1.html', {maxVisits: 2});

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
                    expect(session.maxVisits).to.equal(2)
                    expect(session.isActive()).to.be.false
                    expect(session.isComplete()).to.be.true
                    expect(pageCounter).to.equal(2)
                    done()
                })
                .catch(done)
                // without the following line, failed expects in the 'then' callback wouldn't fail the test
                .done(() => {
                    server.destroy()
                })

                // AFTER
                expect(session.isActive()).to.be.true
            })
        })
    })

    describe('pageOptions options', () => {
        it('should pass it on to all Page instances it creates');
    })
})
