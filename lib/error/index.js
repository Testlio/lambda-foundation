"use strict";

const Reporter  = require('./reporter.js');
const config    = require('../configuration');
const Promise   = require('promiscuous');

module.exports = {
    error: function(code, message, info) {
        const error = new Error(`${code}: ${message}`);
        error.code = code;
        error.info = info;

        return error;
    },

    report: function(error) {
        return new Promise(function(resolve) {
            if (config.env === 'production') {
                return resolve(error);
            }
            try {
                Reporter.report(error).then(resolve);
            } catch (err) {
                console.log('Error reporting error', err);
                resolve(error);
            }
        });
    }
};
