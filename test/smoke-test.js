/**
    Module: @mitchallen/microservice-core
      Test: smoke-test
    Author: Mitch Allen
*/

"use strict";

var should = require('should'),
    testName = require("../package").name,
    testVersion = require("../package").version,
    verbose = process.env.SERVICE_VERBOSE || false,
    testPort = process.env.TEST_SERVICE_PORT || 8100;

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
        }
        
        var modulePath = '../index';
        // Needed for cleanup between tests
        delete require.cache[require.resolve(modulePath)];
        var server = require(modulePath)(options);
        should.exist(server);
        server.close(done);
    });
});