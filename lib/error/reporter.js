"use strict";

const Promise   = require('promiscuous');
const Raygun    = require('raygun');
const RaygunClient = initRaygun();

function initRaygun() {
    let apiKey = process.env.RAYGUN_APIKEY;
    if(apiKey) {
        return new Raygun.Client().init({ apiKey: apiKey });
    }
    console.log('Raygun not initialized - missing API key');
    return {
        send: function(error, data, cb){
            cb();
        }
    };
}

function send(error, cb) {
    RaygunClient.send(error, error.data, cb, error.info);
}

module.exports = {
    report: function(error) {
        return new Promise(function(resolve) {
            send(error, function() {
                resolve(error);
            });
        });
    }
};
