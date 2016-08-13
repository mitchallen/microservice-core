@mitchallen/microservice-core
===========================

A node.js core module for creating microservices
------------------------------------------------

The purpose of this module is to help you create a microservice - an HTTP endpoint that only does one thing.

* * *

## Installation

You must use __npm__ __2.7.0__ or higher because of the scoped package name.

    $ npm init
    $ npm install @mitchallen/microservice-core --save
  
* * *

## What is a Microservice?

*"Microservices is an approach to application development in which a large application is built as a suite of modular services. Each module supports a specific business goal and uses a simple, well-defined interface to communicate with other modules."* - [Margaret Rouse](http://searchitoperations.techtarget.com/definition/microservices)

*"In short, the microservice architectural style is an approach to developing a single application as a suite of small services, each running in its own process and communicating with lightweight mechanisms, often an HTTP resource API. These services are built around business capabilities and independently deployable by fully automated deployment machinery. There is a bare minimum of centralized management of these services, which may be written in different programming languages and use different data storage technologies."* - [Martin Fowler](http://martinfowler.com/articles/microservices.html)

### The basic idea

A large monolithic Web site is basically a [God object](https://en.wikipedia.org/wiki/God_object).  Most developers will tell you that such objects are bad. But then they go back to work on their giant Web app that takes 8 hours to compile and requires bringing the system down all night to upgrade. It may contain a dozen or even a hundred HTTP endpoints that are intertwined and difficult to maintain or deploy. If any of them break they may take down the whole site.  To work on any part of the system developer may need access to *all* of the source code.

A microservice on the other has only *one* endpoint (like: *example.com/api/login*).  It's small, self-contained, easy to maintain and can be deployed in seconds. If it is being deployed or breaks, it should have no effect on the other endpoints or the site. Developers can be restricted to only work on the code for the microservices they are assigned.

See also:

* [Fred George: Challenges in Implementing MicroServices (video)](https://www.youtube.com/watch?v=yPf5MfOZPY0)
* [“It’s Not Just Microservices”: Fred George Discusses Technology, Process and Organisation Inhibitors](https://www.infoq.com/news/2016/02/not-just-microservices)
* [Microservices without the Servers (Amazon)](https://aws.amazon.com/blogs/compute/microservices-without-the-servers/)
* [Adopting Microservices at Netflix: Lessons for Architectural Design](https://www.nginx.com/blog/microservices-at-netflix-architectural-best-practices/)
* [Yelp Engineering: Using Services to Break Down a Monolith](https://www.infoq.com/news/2015/03/yelp-soa-break-monoliths)
* [Scaling Gilt: from Monolithic Ruby Application to Distributed Scala Micro-Services Architecture](https://www.infoq.com/presentations/scale-gilt)
* [How we ended up with microservices (Soundcloud)](http://philcalcado.com/2015/09/08/how_we_ended_up_with_microservices.html)

* * *

## Usage

This core module can be used as a basis for a simple REST microservice or extended to provide REST + database access.

It works by letting you wrap an __[ExpressJS](https://expressjs.com) router__ HTTP method in a service object and passing that to the core object. The core object does all the work of setting up ExpressJS and lets you just worry about the one microservice. 

### Define a Service Object

    var service = {
    	name: ...,
    	version: ...,
    	verbose: ...,
    	apiVersion: ...,
    	port: ...,
    	method: function (info) {
    	
    		var router = info.router;
    		
    		router.[get,post,put,patch,delete] ... { 
    		    ... 
    		};
    		
			return router;
    	}

    };
    
#### service.name

This can be any string. I just use the package name. If __verbose__ is on, this is printed along with the __version__ and __port__ when the service is started up:

    name: require("./package").name,
    
#### service.version

This can be any string. I just use the package version.

    version: require("./package").version,
    
#### service.verbose

Can be true of false.  If __true__ will print __name__, __version__ and __port__ to the console on startup.

#### service.apiVersion

Used to define a prefix for URL's.  For example if apiVersion = "/v1" then you will need to browse to "/v1/{service}".

#### service.port

The port to listen on.

#### service.method

Set the __method__ to a function that takes one parameter (*info*).

    method: function (info) {

        var router = info.router;
        var connection = info.connection;	// database option

        router.[get,post,put,patch,delete] ... { 
            ... 
        };

        return router;
    }

##### info.router

The *info* parameter contains a pointer to a __router__. The router returned is an __ExpressJS router__. You can find out more about it here:

[https://expressjs.com/en/guide/routing.html](https://expressjs.com/en/guide/routing.html)

Once you have a handle to the router you can use it to define an endpoint for handling HTTP method requests (get, post, etc.).  See the router documentation for more info.

##### info.connection

To allow for methods that can access a database an __info.connection__ value may also be returned.

For example, this is how you would define a service method for use with [@mitchallen/microservice-dynamo](https://www.npmjs.com/package/@mitchallen/microservice-dynamo):

    method: function(info) {
    
        var router = info.router,
            dynamo = info.connection.dynamo;

        router.get( '/table/list', function (req, res) {

            dynamo.listTables(function (err, data) {
                if( err ) {
                    console.error(err);
                    res
                      .status(500)
                      .send(err);
                } else {
                    if( info.verbose ) {
                      console.log('listTables:', data);
                    }
                    res.json(data);
                }
            });
        });
        return router;
    }
    
To give you and idea of how it works, this is what my dynamo module does internally to add the connection to the method call:

    /**
      Module: @mitchallen/microservice-dynamo
      Author: Mitch Allen
    */

    /*jslint es6 */

    "use strict";

    module.exports = function (spec) {

      let AWS = require('aws-sdk');
      let dynamoConfig = require('./dynamo-config');
      let credentials = dynamoConfig.credentials;

      AWS.config.update(credentials);

      let connection = {
        dynamo: new AWS.DynamoDB(),
        docClient: new AWS.DynamoDB.DocumentClient()
      };

      let options = {
        service: spec,
        connection: connection
     };

      return require('@mitchallen/microservice-core')(options);
    };
    
The original service object (passed into the constructor as __spec__) is added to the __options__ object to pass to the core.  But the __connection__ property is also filled with information specific to the Amazon Dynamo connection so that your method can also use that.

##### return value

Finally, your method must return the router that it was passed. That's because internally your method is being called by the __ExpressJS__ __use()__ method. That method will expect a router to be returned.

* * *
    
### Attach the Service Object to an Option Object

The name on the left must be called __service__.

    var options = {
    	service: service
    }

### Pass the Options to the microservice-core module:

    require('@mitchallen/microservice-core')(options);
    
Or if you want to export the returned value:

    module.exports = require('@mitchallen/microservice-core')(options);

#### Return Value

The object returned by the module contains a __server__ field: 

    { server: server }


It's a pointer to the express modules server. If you are familiar with express, it's the value returned by __app.listen__. You don't need to actually return anything. It was handy for me to use the __close__ method in the unit tests so I wouldn't get port-in-use errors. It's also used internally when the module unexpectedly terminates.  

Here is an example of how it to create it, then use the __server__ return value to close it (checking for null omitted for brevity):

    var obj = require('@mitchallen/microservice-core')(options);
    var server = obj.server;
    server.close();

* * *

### Heartbeat Example

This example can be found in the __examples / heartbeat__ folder in the git repo.

#### Step 1: Create a project folder

Open up a terminal window and do the following:

    $ mkdir heartbeat
    $ cd heartbeat 
    
#### Step 2: Setup and Installation

You must use __npm__ __2.7.0__ or higher because of the scoped package name.

    $ npm init
    $ npm install @mitchallen/microservice-core --save

### Step 3: Create index.js

Using your favorite text editor, create a file called __index.js__ in the root of the project folder.

Cut and paste the contents below into it.

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

#### Step 4: Test It

To test:

1. in a terminal window type:

        node index.js

2. In a second terminal window type:

        curl -i -X GET -H "Content-Type: application/json" http://localhost:8001/v1/heartbeat

3. Or in Chrome, browse to:

        http://localhost:8001/v1/heartbeat
        
4. To stop the service, in the original window press __Ctrl-C__.
        
* * *

### Database Example

See the [@mitchallen/microservice-dynamo](https://www.npmjs.com/package/@mitchallen/microservice-dynamo) module for an example of extending the core to use Amazon DynamoDB

You can find a working database example here:

* [https://bitbucket.org/mitchallen/microservice-demo-table-list](https://bitbucket.org/mitchallen/microservice-demo-table-list)

* * *

## Testing

To test the module, go to the root folder and type:

    $ npm test
   
* * *
 
## Repo(s)

* [bitbucket.org/mitchallen/microservice-core.git](https://bitbucket.org/mitchallen/microservice-core.git)
* [github.com/mitchallen/microservice-core.git](https://github.com/mitchallen/microservice-core.git)

* * *

## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

* * *

## Version History

#### Version 0.2.2 release notes

* Added port in use test
* Removed process signal handling 

#### Version 0.2.1 release notes

* Fixed issue with uncaught exception handler interfering with unit tests

#### Version 0.2.0 release notes

* Bumped minor version number because broke backward compatibility
  * Module now returns __{ server: server }__ instead of just __server__.
* Added get url test
* Added additional error handling

#### Version 0.1.4 release notes

* Added more info to the __README__

#### Version 0.1.3 release notes

* Added __examples / heartbeat__ demo
* Updated __README__ with example and background info

#### Version 0.1.2 release notes

* Added __.npmignore__ to filter out test folder, etc

#### Version 0.1.1 release notes

* Ran __jslint__ against __index.js__
* Added __bitbucket__ to repo listing
* Added pointer to working example in __README__

#### Version 0.1.0 release notes

* Initial release
