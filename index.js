'use strict';

const _ = require('lodash');

const configuration = require('./lib/configuration');
const auth = require('./lib/authentication');
const discovery = require('./lib/discovery');
const error = require('./lib/error');

// Create/read in a base HREF and resolve resources
const baseURL = _.trimEnd(_.get(configuration, 'url.base', ''), '/');
const resources = discovery(baseURL);

module.exports = {
    authentication: auth,
    configuration: configuration,
    discovery: resources,
    error: error
};
