const http = require('http')
const http_shutdown = require('http-shutdown');
var fs = require('fs');
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

    describe('download', (done) => {
        it('should download the specified resource to the local filesystem', (done) => {
            var expected = JSON.stringify({some: 'json'});
            var downloader = new Downloader('http://127.0.0.1:8082/some.json');

            // run an http server to test against (wayyyy easier than creating stubs)
            // for every library involded in the request
            var server = http.createServer(function (req, res) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(expected);
            });

            // this helps us to (gracefully) shutdown the server at the end of the test
            server = http_shutdown(server)
            server.listen(8082)

            downloader.download()
            .then((data) => {
                expect(data.url).to.equal(downloader.url);
                expect(data.local_file_path.startsWith('./public/downloads')).to.equal(true)
                expect(fs.statSync(data.local_file_path).isFile()).to.equal(true);
                expect(fs.readFileSync(data.local_file_path, 'utf8')).to.equal(expected);
                expect(data.stats).to.equal(downloader.stats)
                expect(data.stats).to.deep.equal({})
                expect(data.transferTime).to.equal(downloader.transferTime)
                expect(data.transferTime).to.be.above(0)
                // cleanup; remove downloaded file
                fs.unlinkSync(data.local_file_path)
                done();
            })
            .catch(done)
            .done((param) => {
                server.shutdown()
            });
        });

        it('should reject the returned promise when an error occures during download', (done) => {
            var downloader = new Downloader('http://127.0.0.1:8082/server_nut_running.json');

            var result = downloader.download()
            .then((data) => {
                expect(true).to.equal(false)
                done()
            }).catch((err) => {
                expect(err.code).to.equal('ECONNREFUSED')
                done()
            })
        })
    });

    describe('setGeoDataServiceUrl/getGeoDataServiceUrl', () => {
        it('accepts a URL with a host macro, to be replace with the host specified in the url', () => {
            var downloader = new Downloader();
            downloader.setGeoDataServiceUrl('http://127.0.0.1:8082/geo/json/{{host}}')
            expect(downloader.getGeoDataServiceUrl, 'http://127.0.0.1:8082/geo/json/{{host}}')
            downloader._hostname = 'asofterworld.com'
            expect(downloader.getGeoDataServiceUrl, 'http://127.0.0.1:8082/geo/json/asofterworld.com')
        })
    })

    describe('getGeoData', (done) => {
        it('retrieves data from an Geoservice API', (done) => {
            var geodata = fs.readFileSync('./test/fixtures/asofterworld.com.geo.json')

            // run an http server to test against (wayyyy easier than creating stubs)
            // for every library involded in the request
            var server = http.createServer(function (req, res) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(geodata);
            });

            // this helps us to (gracefully) shutdown the server at the end of the test
            server = http_shutdown(server)
            server.listen(8082)

            var downloader = new Downloader('http://127.0.0.1:8082/geodata.json');
            // shortcut so we don't have to perform a download first
            downloader._hostname = 'asofterworld.com'
            downloader.setGeoDataServiceUrl('http://127.0.0.1:8082/geodata/json/{{host}}')
            downloader.getGeoData()
            .then((geoData) => {
                expect(geoData).to.equal(downloader.geoData)
                expect(geoData).to.deep.equal(JSON.parse(geodata))
                done()
            })
            .catch(done)
            .done((param) => {
                server.shutdown()
            });
        })
    })
});
