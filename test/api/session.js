const chai          = require('chai')
const chaiHttp      = require('chai-http')
const app           = require('../../src/app')
const SessionModel  = require('../../src/model/session/model')
const PageModel     = require('../../src/model/page/model')
const _             = require('lodash')
const Promise       = require('bluebird')
chai.use(chaiHttp);

// make sure our API service is running before running the test cases
before((done) => { app.start(done) })

describe('API', () => {
    describe('GET /session', function(){
        this.timeout(6000)

        beforeEach((done) => {
            var promises = _.map([0,1,2,3,4,5,6,7,8,9,10,11], (idx) => {
                var session = new SessionModel({url: idx});
                return session.save()
            })

            Promise.all(promises).nodeify(done)
        })

        afterEach((done) => {
            // cleanup our mess
            SessionModel.remove({}, done)
        })

        it('should list the 10 most recent sessions', (done) => {
            chai.request(app)
            .get('/session')
            .end((err, res) => {
                // console.log(res.body)
                expect(err).to.eql(null)
                expect(res).to.have.status(200);
                expect(res.body).to.be.a('array');
                expect(_.map(res.body, (item) => {return parseInt(item.url)})).to.eql([11,10,9,8,7,6,5,4,3,2])
                done(err);
            })
        })
    })

    describe('GET /session/:id', function(){
        this.timeout(4000)

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

    describe('POST /session', function(){
        this.timeout(30000) // #0 seconds; running on a free travis CI account can get slow

        beforeEach((done) => {
            // remove all session and page records
            Promise.all([
                SessionModel.remove({}).exec(),
                PageModel.remove({}).exec()
            ]).nodeify(done)
        })

        afterEach((done) => {
            // remove all session and page records
            Promise.all([
                SessionModel.remove({}).exec(),
                PageModel.remove({}).exec()
            ]).nodeify(done)
        })

        it('should create a session DB record and start fetching pages', (done) => {
            chai.request(app)
            .post('/session')
            .send({url: 'http://localhost:'+app.port+'/fixtures/api/session/page1.html', max_visits: 2})
            .end((err, res) => {
                expect(err).to.be.null
                expect(res).to.have.status(201);
                expect(res.body.max_visits).to.eql(2)
                expect(res.body.url).to.eql('http://localhost:'+app.port+'/fixtures/api/session/page1.html')
                var checker = () => {
                    PageModel.count({}, (err, count) => {
                        if(err){ done(err); return; }

                        // wait till all five are loaded
                        if(count == 2){
                            SessionModel.findOne({}, (err, session) => {
                                if(err){ done(err); return; }

                                PageModel.find({}, (err, pages) => {
                                    expect(pages.length).to.equal(2)
                                    _.each(pages, (curpage) => {
                                        expect(session.pages).to.include(curpage._id)
                                    })

                                    done(err)
                                    return
                                })
                            })

                            return;
                        }

                        setTimeout(checker, 300);
                    })
                }
                setTimeout(checker, 300);
            })
        })
    })
})
