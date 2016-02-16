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
        send: function(error, data, cb, request, tags){
            console.log(error, tags);
            cb();
        }
    };
}

function send(error, cb, tags) {
    RaygunClient.send(error, {}, cb, error.info, tags);
}

module.exports = {
    report: function(error, tags) {
        return new Promise(function(resolve) {
            send(error, function() {
                resolve(error);
            }, tags);
        });
    }
};
