var sinon = require('sinon');
var fs = require('fs');
var request = require('request');
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
            sinon.stub(request, 'get');
        });

        afterEach(() => {
            request.get.restore();
        });

        it('should download the specified resource to the local filesystem, by default to the folder <cwd>/public/downloads/', (done) => {
            var downloader = new Downloader('http://foo_host/some.json');
            var expected = JSON.stringify({some: 'json'});

            request.get.callsArgWith(1, null, null, expected);
            var result = downloader.download().then((data) => {
                expect(data.url).to.equal(downloader.url);
                expect(data.local_file_path.startsWith('./public/downloads')).to.equal(true)
                expect(fs.statSync(data.local_file_path).isFile()).to.equal(true);
                expect(fs.readFileSync(data.local_file_path, 'utf8')).to.equal(expected);

                // cleanup; remove downloaded file
                fs.unlinkSync(data.local_file_path)
                done();
            }).catch(done);
        });
    });
});
