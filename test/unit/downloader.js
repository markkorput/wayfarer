var sinon = require('sinon');
var http = require('http');
var PassThrough = require('stream').PassThrough;

import Downloader from '../../src/downloader';

describe('downloader', () => {
    describe('constructor', () => {
        it('takes a URL param', () => {
            var downloader = new Downloader('http://foo_host/some.json');
            expect(downloader.url).to.equal('http://foo_host/some.json');
        })
    });

    describe('download', () => {
        beforeEach(() => {
            sinon.stub(http, 'request');
        });

        afterEach(() => {
            http.request.restore();
        });

        it('should download the specified resource to the local filesystem, by default to the folder <cwd>/public/downloads/', (done) => {
            var downloader = new Downloader('http://foo_host/some.json');
            var expected = {some: 'json'};
            var response = new PassThrough();
            response.write(JSON.stringify(expected));
            response.end();

            var request = new PassThrough();
            http.request.callsArgWith(1, response)
                        .returns(request);

            var result = downloader.download();
            result.then((data) => {
                //expect(data.local_file_path).to.equal('../../public/downloads/timestamp');
                expect(data.url).to.equal(downloader.url);
                // TODO: check file
                done();
            });
        });
    });
});
