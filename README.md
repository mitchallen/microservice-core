@mitchallen/microservice-core
===========================

A node.js core module for creating microservices
------------------------------------------------

## Installation

You must use __npm__ __2.7.0__ or higher because of the scoped package name.

    $ npm init
    $ npm install @mitchallen/microservice-core --save
  
* * *

## Usage

This core module can be used as a basis for a simple REST service or extended to provide REST + database access.

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

# TODO
    
### Attach the Service Object to an Option Object

The name on the left must be called __service__.

    var options = {
    	service: service
    }


### Pass the Options to the microservice-core module:

    module.exports = require('@mitchallen/microservice-core')(options);

* * *

### Heartbeat Example

This example can be found in the examples/hearbeat folder in the git repo.

#### Step 1: Create a project folder

Open up a terminal window and do the following:

    $ mkdir heartbeat
    $ cd heartbeat 
    
#### Step 2: Setup an Installation

Follow thing __npm init / install__ instructions above

### Step 3: Create index.js

Using your favorite text editor, create a file called index.js in the root of the project folder.

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

* * *

## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

* * *

## Version History

#### Version 0.1.3 release notes

* Added examples/heartbeat demo
* Updated README with example

#### Version 0.1.2 release notes

* Added .npmignore to filter out test folder, etc

#### Version 0.1.1 release notes

* Ran jslint against index.js
* Added bitbucket to repo listing
* Added pointer to working example in README

#### Version 0.1.0 release notes

* Initial release
