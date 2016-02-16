"use strict";

const Reporter  = require('./reporter.js');
const Promise   = require('promiscuous');

module.exports = function(tags) {

    let error = function(code, message, extra, request) {
        const error = new Error(`${code}: ${message}`);
        error.code = code;
        error.extra = extra;
        error.request = request;

        return error;
    };

    let report = function(error) {
        return new Promise(function(resolve) {
            try {
                Reporter.report(error, tags).then(resolve);
            } catch (err) {
                console.log('Error reporting error ' + error, err);
                resolve(error);
            }
        });
    };
    return {error, report};
};
