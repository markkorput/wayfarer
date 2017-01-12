const express    = require('express');
const mongoose   = require('mongoose');
const helmet     = require('helmet');
const bodyParser = require('body-parser');
const morgan     = require('morgan');
const bluebird   = require('bluebird');
const config     = require('config');
const routes     = require('./routes');
const http          = require('http');
const http_shutdown = require('http-shutdown');
const app        = express();

// Configure Database Interface
mongoose.Promise = bluebird;

// Configure Middleware
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('tiny'));

// Register our API routes
app.use('/', routes);

// Create HTTP-Server; http_shutdown makes it easier to... shutdown
var server = http_shutdown(http.createServer(app));

var isRunning = false

app.start = function(){
    if(isRunning) return;

    // connect to database server
    mongoose.connect(config.get('wayfarer.mongodb.url'));
    // start our HTTP server
    server.listen(config.get('wayfarer.server.port'));
    console.log('Wayfarer API available on port ', config.get('wayfarer.server.port'));
    isRunning = true
}

app.isRunning = function(){
    return isRunning === true;
}

app.shutdown = function(){
    if(isRunning !== true) return;

    mongoose.disconnect()
    server.shutdown()

    console.log('Wayfarer API is down')
    isRunning = false;
}

if(require.main === module){
    app.start()
}

module.exports = app
