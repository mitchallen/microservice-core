/**
   Project: examples/heartbeat
    Author: Mitch Allen

   To test:

   1. in a terminal window type:

       node index.js

   2. In a second terminal window type:

       curl -i -X GET -H "Content-Type: application/json" http://localhost:8001/v1/heartbeat

   3. Or in Chrome, browse to:

       http://localhost:8001/v1/heartbeat
*/

/*jslint es6 */

"use strict";

// Define a Service object
var service = {

    // Get the name and version from package.json
    name: require("./package").name,
    version: require("./package").version,

    // Turn on console message
    verbose: true,

    // Get API version from env or use default if null
    // Used in URL, such as http://localhost:8001/{API-VERSION}/heartbeat
    apiVersion: process.env.API_VERSION || '/v1',

    // Get the port to listen on from env or use default if null
    port: process.env.HEARTBEAT_PORT || 8001,

    // microservice-core will pass an object containing an ExpressJS router.
    // Use the router to define HTTP handlers
    method: function (info) {

        // Get the Express.JS router from the options
        var router = info.router;

        // Add an HTTP GET handler to the router
        router.get('/heartbeat', function (req, res) {
            // Specifiy a JSON formatted response
            var data = {
                type: "heartbeat",
                status: "OK",
                message: 'service is running',
                timestamp: new Date(Date.now())
            };
            // Return the JSON response
            res.json(data);
        });

        // Return the router (required).
        return router;
    }
};

// Create an options object
var options = {
    // Add the service object to the options object
    service: service
};

// Pass the options to microservice-core
module.exports = require('@mitchallen/microservice-core')(options);

// microservice should now be listening on the port
// Test with Chrome browser or curl command