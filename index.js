'use strict';

const path = require('path');

const config = require('./lib/configuration')(path.resolve(process.cwd(), 'config'));
const auth = require('./lib/authentication');
const discovery = require('./lib/discovery');

module.exports = function() {
    // Create/read in a base HREF and resolve resources
    const resources = discovery('', path.resolve(process.cwd(), 'discovery.json'));

    return {
        authentication: auth,
        configuration: config,
        discovery: resources
    };
}();
