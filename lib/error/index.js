'use strict';

const Raygun = require('./raygun.js');
const Promise = require('promiscuous');

let tags = [];

module.exports = {
    config: function(options) {
        tags = options.tags || tags;
        Raygun.config(options);
    },

    error: function(code, message, extra, request) {
        const result = new Error(`${code}: ${message}`);
        result.code = code;
        result.extra = extra;
        result.request = request;

        return result;
    },

    report: function(error, additionalTags) {
        let sentTags = tags ? [].concat(tags) : [];

        if (additionalTags) {
            sentTags = sentTags.concat(additionalTags);
        }

        return Promise.resolve(sentTags).then(function(t) {
            // Need this wrapping so that our internal implementation can safely throw errors
            return new Promise(function(resolve) {
                Raygun.send(error, error.extra, function() {
                    // Resolve with the error, so that our caller can finish deal
                    // with it further
                    resolve(error);
                }, error.request, t);
            });
        }).catch(function(err) {
            // Return the same error that we were supposed to report
            // and simply log out the error that actually occurred during reporting
            console.error(err); //eslint-disable-line no-console
            return error;
        });
    }
};
