/**
    module: @mitchallen/microservice-core
    author: Mitch Allen
*/

/*jshint node: true */
/*jshint esversion: 6 */

"use strict";

let express = require('express');
let parser = require("body-parser");
let app = express();
let router = new express.Router();

module.exports.Service = function (spec) {

    spec = spec || {};

    var name = spec.name,
        version = spec.version,
        verbose = spec.verbose,
        port = spec.port,
        apiVersion = spec.apiVersion,
        method = spec.method;

    // Parse: application/json
    app.use(parser.json());

    // Parse: application/x-www-form-urlencoded
    app.use(parser.urlencoded({extended: true}));

    router.stack = [];

    var info = Object.assign(
        spec,
        {
            router: router
        }
    );

    app.use(apiVersion, method(info));

    let server = app.listen(
        port,
        function () {
            if (verbose) {
                console.log(
                    "%s, %s: listening on port %s",
                    name,
                    version,
                    port
                );
            }
        }
    ).on('error', function (err) {
        if (err.errno === 'EADDRINUSE') {
            console.error(
                "### ERROR: %s, %s: port %s in use",
                name,
                version,
                port
            );
        }
    });

    return {
        server: server
    };
};