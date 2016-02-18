'use strict';

const path = require('path');
const _ = require('lodash');

const config = require('./lib/configuration')(path.resolve(process.cwd(), 'config'));
const auth = require('./lib/authentication');
const discovery = require('./lib/discovery');
const error = require('./lib/error');

module.exports = function() {
    // Create/read in a base HREF and resolve resources
    const baseURL = _.trimEnd(_.get(config, 'url.base', ''), '/');
    const resources = discovery(baseURL, path.resolve(process.cwd(), 'discovery.json'));

    return {
        authentication: auth,
        configuration: config,
        discovery: resources,
        error: error
    };
}();
