if(process.env.NODE_ENV != 'ci') process.env.NODE_ENV = 'test';
var app = require('../../src/app')

module.exports = function(root) {
  root = root ? root : global;
  root.expect = root.chai.expect;
  root.timeout_multiply = parseFloat(process.env.TEST_TIMEOUT_MULTIPLY || 1.0)
  console.log('timeout_multiply: ', root.timeout_multiply)

  // make sure the app is shutdown. If it was never started by
  // any of the tests, this won't do anything
  after((done) => { app.shutdown(done) })

  beforeEach(() => {
    // Using these globally-available Sinon features is preferrable, as they're
    // automatically restored for you in the subsequent `afterEach`
    root.sandbox = root.sinon.sandbox.create();
    root.stub = root.sandbox.stub.bind(root.sandbox);
    root.spy = root.sandbox.spy.bind(root.sandbox);
    root.mock = root.sandbox.mock.bind(root.sandbox);
    root.useFakeTimers = root.sandbox.useFakeTimers.bind(root.sandbox);
    root.useFakeXMLHttpRequest = root.sandbox.useFakeXMLHttpRequest.bind(root.sandbox);
    root.useFakeServer = root.sandbox.useFakeServer.bind(root.sandbox);
  });

  afterEach(() => {
    delete root.stub;
    delete root.spy;
    root.sandbox.restore();
  });
};
