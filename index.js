/**
    module: @mitchallen/microservice-core
    author: Mitch Allen
*/

/*jslint es6 */

"use strict";

module.exports = function (spec) {

    let service = spec.service;
    let express = require('express');
    let parser = require("body-parser");
    let app = express();
    let router = new express.Router();
    let info = {
        router: router,
        connection: spec.connection
    };

    // Parse: application/json
    app.use(parser.json());

    // Parse: application/x-www-form-urlencoded
    app.use(parser.urlencoded({extended: true}));

    router.stack = [];

    app.use(service.apiVersion, service.method(info));

    let server = app.listen(
        service.port,
        function () {
            if (service.verbose) {
                console.log(
                    "%s, %s: listening on port %s",
                    service.name,
                    service.version,
                    service.port
                );
            }
        }
    ).on('error', function (err) {
        if (err.errno === 'EADDRINUSE') {
            console.error(
                "### ERROR: %s, %s: port %s in use",
                service.name,
                service.version,
                err.port
            );
        }
    });

    return {
        server: server
    };
};