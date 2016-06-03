'use strict';

const util = require('../util.js');
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

/**
 * A marker function that transform can reduce to a static object
 */
function loadDiscovery(file) {
    try {
        return JSON.parse(fs.readFileSync(file));
    } catch (err) {
        return {};
    }
}

/**
 *  Generate discovery related resources with a base URL
 *
 *  Once browserified, this function will ignore all resource files and
 *  always use the same resources to resolve against the provided baseURL
 *
 *  @param baseURL - Base URL for the resulting resources, all resources will be
 *                   resolved relative to this
 *
 *  @returns resolved resources as an object
 */
module.exports = function(baseURL) {
    const locatedDiscoveryDirectory = util.closestParentImporting(process.cwd(), 'lambda-foundation');
    const resourcesFile = process.env.LAMBDA_DISCOVERY_FILE || path.join(locatedDiscoveryDirectory, 'discovery.json');
    const resources = loadDiscovery(resourcesFile);

    return {
        resources: resolveObject(resources.resources, baseURL, true)
    };
};
