const express    = require('express');
const mongoose   = require('mongoose');
const helmet     = require('helmet');
const bodyParser = require('body-parser');
const morgan     = require('morgan');
const Promise    = require('bluebird');
const config     = require('config');
const routes     = require('./routes');
const http          = require('http');
const http_shutdown = require('http-shutdown');
const app        = express();

// Configure Database Interface
mongoose.Promise = Promise;

// Configure Middleware
app.use(helmet());
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('tiny'));

// Register our API routes
app.use('/', routes);

// Create HTTP-Server; http_shutdown makes it easier to... shutdown
var server = http_shutdown(http.createServer(app));

var isRunning = false
app.port = config.get('wayfarer.server.port')

app.start = function(callback){
    return new Promise((resolve, reject) => {
        if(isRunning){
            resolve();
            return;
        }

        // connect to database server
        mongoose.connect(config.get('wayfarer.mongodb.url'))
        .then(() => {
            // start our HTTP server
            server.listen(app.port);
            console.log('Wayfarer API available on port ', app.port);
            isRunning = true
            resolve()
        })
        .catch(err => {
            console.warn('Mongoose.connect failed')
            reject(err)
        })
    }).nodeify(callback)
}

app.isRunning = function(){
    return isRunning === true;
}

app.shutdown = function(callback){
    return new Promise((resolve, reject) => {
        if(isRunning !== true){
            resolve()
            return;
        }

        mongoose.disconnect()
        .then(() => {
            server.shutdown()
            console.log('Wayfarer API is down')
            isRunning = false;
            resolve()
        })
        .catch(err => {
            console.warn('Mongoose.disconnect gave an error')
            reject(err)
        })
    }).nodeify(callback)
}

if(require.main === module){
    app.start()
}

module.exports = app
