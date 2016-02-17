'use strict';

const Reporter  = require('./reporter.js');
const Promise   = require('promiscuous');

module.exports = function(tags) {

    const error = function(code, message, extra, request) {
        const errorObj = new Error(`${code}: ${message}`);
        errorObj.code = code;
        errorObj.extra = extra;
        errorObj.request = request;

        return errorObj;
    };

    const report = function(errorToReport) {
        return new Promise(function(resolve) {
            try {
                Reporter.report(errorToReport, tags).then(resolve);
            } catch (err) {
                resolve(errorToReport);
            }
        });
    };
    return {error, report};
};
