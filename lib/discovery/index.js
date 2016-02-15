'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');

function resolveObject(object, prefix, skipSelf) {
    let results = {};

    if (!skipSelf) {
        results.href = prefix;
    }

    _.forOwn(object, function(value, key) {
        if (_.isEmpty(value)) {
            _.set(results, key + '.href', prefix + '/' + key);
        } else if (_.isObject(value) && value.resources) {
            results[key] = resolveObject(value.resources, prefix + '/' + key, value.passthrough);
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
//  Generate discovery related resources based on a file and a baseURL
//  The file is assumed to be 'discovery.json' in the provided directory
//
//  Once browserified, the function will ignore all resource directories and
//  always use the baseURL to resolve against the same static discovery file
//
module.exports = function(baseURL, resourcesDirectory) {
    const resources = loadDiscovery(path.resolve(resourcesDirectory, 'discovery.json'));

    return {
        resources: resolveObject(resources.resources, baseURL, true)
    };
};
