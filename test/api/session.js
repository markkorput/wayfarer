const chai          = require('chai')
const chaiHttp      = require('chai-http')
const app           = require('../../src/app')
const SessionModel  = require('../../src/model/session/model')
chai.use(chaiHttp);

// make sure our API service is running before running the test cases
before(app.start)

describe.only('API', () => {
    describe('GET /session', () => {
        it('should list the last 10 sessions', (done) => {
            // create some records
            SessionModel.remove({}).exec()

            for(var i=0; i<12; i++){
                var session = new SessionModel({url: i});
                session.save()
            }

            chai.request(app)
            .get('/session')
            .end((err, res) => {
                SessionModel.remove({}).exec()
                expect(err).to.eql(null)
                expect(res).to.have.status(200);
                expect(res.body).to.be.a('array');
                expect(res.body.length).to.be.eql(12);
                done(err);
            })
        })
    })

    describe('GET /session/:id', () => {
        it('should show a session\'s details');
    })

    describe('GET /session/:id/with/pages', () => {
        it('should show a session\'s details together with all session\'s pages\' details');
    })

    describe('POST /session', () => {
        it('should create a session record and start fetching pages');
    })
})
