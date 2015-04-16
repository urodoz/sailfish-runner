#Sailfish-CI Runner

Runner for [Sailfish CI Server](https://github.com/urodoz/sailfish-server)

Uses docker to generate containers to test the projects sent by Sailfish CI Server

**This project is under heavy development, and is not ready for production**

## Dependencies

* Docker (the user should have access to the docker services)
* NodeJS >= 0.10.36
* NPM
* Bower

## Installation

Install the NPM dependencies and Bower dependencies

    npm install
    cd public && bower install
    
## Configuration

Change the file ```configuration.js``` to match your needs. The parameter **endpoint** is the base url of
the Sailfish CI Server and should be visible from the runner

## Start the runner

You can start the runner with:

    npm run-script run
    
Or you can use [PM2](https://github.com/Unitech/pm2) to start as service

    npm run-script pm2_start
    
After the init, you can access the monitor status through the address http://{runnerIP}:{port}. The *port* is
configurable on the file ```configuration.js```, by default is 13900

###About

* Sailfish logo : Image courtesy of vectorolie at FreeDigitalPhotos.net
