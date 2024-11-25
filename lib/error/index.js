'use strict';

const Promise = require('promiscuous');
const Config = require('../configuration');

let tags = [];

if (Config.project && Config.project.name) {
    tags = tags.concat(Config.project.name);
} else if (Config.aws && Config.aws.projectName) {
    tags = tags.concat(Config.aws.projectName);
}

/**
 * Report an error, with optional additional tags
 *
 * @param error - error to report
 * @param additionalTags - optional additional tags to report, along with the
 *                          default set of tags set on the module
 * @param extra - optional extra metadata to include in the error report
 * @returns promise which resolves into the passed in error
 */
function report(error, additionalTags, extra) {
    let sentTags = tags ? [].concat(tags) : [];

    if (additionalTags) {
        sentTags = sentTags.concat(additionalTags);
    }

    return Promise.resolve(sentTags).then(function() {
        // Need this wrapping so that our internal implementation can safely throw errors
        return new Promise(function(resolve) {
            console.log(error.nativeError ? error.nativeError : error); //eslint-disable-line no-console
            console.log(extra); //eslint-disable-line no-console
            resolve(error);
        });
    }).catch(function(err) {
        // Return the same error that we were supposed to report
        // and simply log out the error that actually occurred during reporting
        console.error(err); //eslint-disable-line no-console
        return error;
    });
}

/**
 * Update error configuration
 *
 * @param object options - new configuration, currently supports:
 *                          tags - tags sent when reporting
 */
function config(options) {
    tags = options.tags || tags;
}

/**
 * Create a new error object
 *
 * @param code - code for the error (for example HTTP response code)
 * @param message - error message
 * @param extra - additional metadata sent when reporting the error
 * @param request - optional request information sent when reporting
 * @returns error object
 */
function LambdaError(code, message, extra, request) {
    Error.captureStackTrace(this, this.constructor);
    this.name = 'LambdaError';
    this.message = `${code}: ${message}`;
    this.code = code;
    this.extra = extra;
    this.request = request;

    // Also capture a native error internally, which
    this.nativeError = new Error(this.message);
    Error.captureStackTrace(this.nativeError, this.constructor);
}

require('util').inherits(LambdaError, Error);
LambdaError.prototype.report = function(additionalTags) {
    report(this, additionalTags);
};

LambdaError.config = config;
LambdaError.report = report;

module.exports = LambdaError;
