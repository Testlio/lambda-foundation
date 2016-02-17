'use strict';

const config = require('./lib/configuration');
const auth = require('./lib/authentication');
const error = require('./lib/error');
const path = require('path');

module.exports = {
    authentication: auth,
    configuration: config(path.resolve(process.cwd(), 'config')),
    error: error
};
