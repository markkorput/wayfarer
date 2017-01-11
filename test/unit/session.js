import Session from '../../src/session';

describe('Session', () => {
    describe('constructor', () => {
        it('takes a url', () => {
            expect((new Session('http://www.xkcd.com')).url).to.equal('http://www.xkcd.com')
        })
    })

    describe('start', function(){
        it('trigges the async process of fetching web-pages and following links', () => {
            var session = new Session('http://127.0.0.1/page1');
            expect(session.isActive()).to.be.false
            session.start()
            expect(session.isActive()).to.be.true
        })
    })
})
