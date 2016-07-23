/**
    Module: @mitchallen/microservice-core
      Test: smoke-test
    Author: Mitch Allen
*/

"use strict";

var request = require('supertest'),
    should = require('should'),
    testName = require("../package").name,
    testVersion = require("../package").version,
    verbose = process.env.SERVICE_VERBOSE || false,
    testPort = process.env.TEST_SERVICE_PORT || 8100,
    testHost = "http://localhost:" + testPort;

describe('microservice core smoke test', function() {

    it('should not throw an error', function(done) {

        var options = {
            service: {
                name: testName,
                version: testVersion,
                verbose: verbose,
                port: testPort,
                apiVersion: "/test1",
                method: function(info) {
                    var router = info.router;
                    return router;
                }
            }
        };
        
        var modulePath = '../index';
        // Needed for cleanup between tests
        delete require.cache[require.resolve(modulePath)];
        var retObj = require(modulePath)(options);
        should.exist(retObj);
        var server = retObj.server;
        should.exist(server);
        server.close(done);
    });


    it('should get url', function(done) {

        let prefix = "/test1";
        let path = "/heartbeat";
        let dataType = "heartbeat";
        let dataStatus = "OK";

        var options = {
            service: {
                name: testName,
                version: testVersion,
                verbose: verbose,
                port: testPort,
                apiVersion: "/test1",
                method: function (info) {
                    var router = info.router;
                    router.get('/heartbeat', function (req, res) {
                        var data = {
                            type: dataType,
                            status: dataStatus,
                        };
                        res.json(data);
                    });
                    return router;
                }
            }
        };
        
        var modulePath = '../index';
        // Needed for cleanup between tests
        delete require.cache[require.resolve(modulePath)];
        var retObj = require(modulePath)(options);
        should.exist(retObj);
        var server = retObj.server;
        should.exist(server);
        
        var testUrl =  prefix + path;
        request(testHost)
            .get(testUrl)
            .expect(200)
            .end(function (err, res){
                should.not.exist(err);
                should.exist(res.body);
                should.exist(res.body.type);
                res.body.type.should.eql(dataType);
                should.exist(res.body.status);
                res.body.status.should.eql(dataStatus);
                server.close(done);
            });
    });

});