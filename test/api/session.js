const chai          = require('chai')
const chaiHttp      = require('chai-http')
const app           = require('../../src/app')
const SessionModel  = require('../../src/model/session/model')
const _             = require('lodash')
const Promise       = require('bluebird')
chai.use(chaiHttp);

// make sure our API service is running before running the test cases
before(app.start)

describe.only('API', () => {
    describe('GET /session', () => {
        beforeEach(() => {
            for(var i=0; i<12; i++){
                var session = new SessionModel({url: i});
                session.save()
            }
        })

        afterEach(() => {
            // cleanup our mess
            SessionModel.remove({}).exec()
        })

        it('should list the 10 most recent sessions', (done) => {
            chai.request(app)
            .get('/session')
            .end((err, res) => {
                expect(err).to.eql(null)
                expect(res).to.have.status(200);
                expect(res.body).to.be.a('array');
                expect(_.map(res.body, (item) => {return parseInt(item.url)})).to.eql([11,10,9,8,7,6,5,4,3,2])
                done(err);
            })
        })
    })

    describe('GET /session/:id', () => {
        afterEach((done) => {
            // cleanup our mess
            SessionModel.remove({}, done)
        })

        it('should show a session\'s details', (done) => {
            // create a session record
            var model = new SessionModel({url: 'http://some_url.com'});

            model.save().then(doc => {
                // verify the record was created and has an ID
                expect(doc._id).to.not.eql(null)
                // perform the API request that we're testing
                chai.request(app)
                .get('/session/'+doc._id)
                .end((err, res) => {
                    // check some values
                    expect(err).to.eql(null)
                    expect(res).to.have.status(200);
                    expect(res.body._id).to.equal(doc._id.toString())
                    expect(res.body.url).to.equal(model.url)
                    // all good?
                    done(err);
                })
            })
        })
    })

    describe('GET /session/:id/with/pages', () => {
        it('should show a session\'s details together with all session\'s pages\' details');
    })

    describe('POST /session', () => {
        it('should create a session record and start fetching pages');
    })
})
