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
                    service.name,
                    service.version,
                    'listening on port ' + service.port
                );
            }
        }
    );

    function terminator(sig) {
        if (typeof sig === "string") {
            console.log('%s: Received %s - terminating Node server ...',
                    new Date(Date.now()), sig);
        }
        server.close();
        process.exit(1);
        console.log('%s: Node server stopped.', new Date(Date.now()));
    }

    //  Process on exit and signals.
    process.on('exit', function () {
        terminator();
    });

    ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS',
            'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGPIPE', 'SIGTERM']
        .forEach(function (element, index, array) {
            process.on(element, function () {
                terminator(element);
            });
        });

    return server;
};