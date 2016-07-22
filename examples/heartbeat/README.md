examples / hearbeat
===================

Demo implementing a heartbeat service
-------------------------------------------------

### Install

Because the __package.json__ file should already contain what you need, simply use this command to install everything:

    $ npm install

### Install and run the app

From your projects root folder, execute the following at the command line:

    $ node index.js

### Test the app using curl commands

    curl -i -X GET -H "Content-Type: application/json" http://localhost:8001/v1/heartbeat

### Test the app in the browser

    http://localhost:8001/v1/heartbeat

### To stop the test app, in the original console window press __Ctrl-C__.