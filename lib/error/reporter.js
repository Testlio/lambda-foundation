"use strict";

const Promise   = require('promiscuous');
const Raygun    = require('./raygun.js');

function send(error, cb, tags) {
    Raygun.send(error, error.extra, cb, error.request, tags);
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
