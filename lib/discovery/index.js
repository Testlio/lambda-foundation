'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');

function resolveObject(object, prefix, skipSelf) {
    const results = {};

    if (!skipSelf) {
        results.href = prefix;
    }

    _.forOwn(object, function(value, key) {
        if (_.isEmpty(value)) {
            _.set(results, key + '.href', _.trimEnd(prefix, '/') + '/' + key);
        } else if (_.isObject(value) && value.resources) {
            results[key] = resolveObject(value.resources, _.trimEnd(prefix, '/') + '/' + key, value.passthrough);
        }
    });

    return results;
}

//
// A marker function that transform can reduce to a static object
//
function loadDiscovery(file) {
    try {
        return JSON.parse(fs.readFileSync(file));
    } catch (err) {
        return {};
    }
}

//
//  Generate discovery related resources with a base URL
//
//  Once browserified, the function will ignore all resource files and
//  always use the baseURL to resolve against the same static discovery file
//
module.exports = function(baseURL) {
    const resourcesFile = process.env.LAMBDA_DISCOVERY_FILE || path.join(process.cwd(), 'discovery.json');
    const resources = loadDiscovery(resourcesFile);

    return {
        resources: resolveObject(resources.resources, baseURL, true)
    };
};
