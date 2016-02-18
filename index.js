'use strict';

const config = require('./lib/configuration');
const auth = require('./lib/authentication');
const error = require('./lib/error');

module.exports = {
    authentication: auth,
    configuration: config,
    error: error
};
