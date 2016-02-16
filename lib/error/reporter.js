"use strict";

const config    = require('../configuration');
const Promise   = require('promiscuous');
const Raygun    = require('raygun');
const RaygunClient = new Raygun.Client().init({ apiKey: 'config.raygun.apiKey' });

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
