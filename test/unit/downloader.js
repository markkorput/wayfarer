var sinon = require('sinon');
var fs = require('fs');
var request = require('request');
var PassThrough = require('stream').PassThrough;

import Downloader from '../../src/downloader';

describe('downloader', () => {
    describe('constructor', () => {
        it('takes a URL param', () => {
            expect((new Downloader('http://foo_host/some.json')).url).to.equal('http://foo_host/some.json');
        })

        it('takes a folder option and adds a trailng slash if necessary', () => {
            expect((new Downloader('someurl', {'folder': './public/http'})).folder).to.equal('./public/http/')
        })
    });

    describe('download', () => {
        beforeEach(() => {
            sinon.stub(request, 'get');
        });

        afterEach(() => {
            request.get.restore();
        });

        it('should download the specified resource to the local filesystem', (done) => {
            var downloader = new Downloader('http://foo_host/some.json');
            var expected = JSON.stringify({some: 'json'});

            var reqstub = sinon.stub();
            reqstub.progressContext = {}
            reqstub.on = sinon.stub();
            reqstub.on = (event, func) => { if(event == 'end') resolve() };
            reqstub.pipe = (stream) => {}

            request.get.returns(reqstub);

            var result = downloader.download().then((data) => {
                expect(data.url).to.equal(downloader.url);
                expect(data.local_file_path.startsWith('./public/downloads')).to.equal(true)
                expect(data.stats.startsWith('./public/downloads')).to.equal(true)
                expect(fs.statSync(data.local_file_path).isFile()).to.equal(true);
                expect(fs.readFileSync(data.local_file_path, 'utf8')).to.equal(expected);

                // cleanup; remove downloaded file
                fs.unlinkSync(data.local_file_path)
                done();
            }).catch(done);
        });

        it('should reject the returned promise when an error occured during download', (done) => {
            var downloader = new Downloader('http://foo_host/some.json');
            var expected = 'some_error'

            var reqstub = sinon.stub();
            reqstub.progressContext = {}
            reqstub.on = sinon.stub();
            reqstub.on = (event, func) => { if(event == 'end') resolve() };
            reqstub.pipe = (stream) => {}

            request.get.returns(reqstub);

            var result = downloader.download().then((data) => {
                expect(true).to.equal(false)
            }).catch((err) => {
                expect(err).to.equal(expected)
                done()
            })
        })
    });
});
