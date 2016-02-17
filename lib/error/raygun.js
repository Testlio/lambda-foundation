'use strict';

const Raygun = require('raygun');

let RaygunClient;

const isProduction = process.env.TESTLIO_ENV === 'production';

const apiKey = process.env.RAYGUN_APIKEY;

if(!isProduction) {
    console.log('Raygun not initialized - env ', process.env.TESTLIO_ENV);
}

if(!apiKey && !isProduction) {
    console.log('Raygun not initialized - missing API key');
}

if(apiKey && isProduction) {
    RaygunClient = new Raygun.Client().init({ apiKey: apiKey });
} else {
    RaygunClient = {
        send: function(error, extra, cb){
            cb();
        }
    };
}

function send(error, extra, cb, request, tags) {
    RaygunClient.send(error, extra, cb, request, tags);
}

module.exports = {
    send: send
};