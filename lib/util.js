'use strict';

const _ = require('lodash');
const path = require('path');
const fs = require('fs');

/**
 *  Utility function for looping deeploy over an object's properties
 *
 *  @param object - object to loop over
 *  @param callback - callback to call for every key-value pair found
 *  @param prefix - prefix to use for the keys that are returned in the callback
 */
function forOwnDeep(object, callback, prefix) {
    prefix = prefix ? prefix + '.' : '';

    _.forOwn(object, function(value, key) {
        if (_.isString(value)) {
            callback(value, prefix + key);
        } else {
            forOwnDeep(value, callback, prefix + key);
        }
    });
}

/**
 *  Helper function for locating the closest parent directory containing
 *  a package.json that lists given package as a (dev) dependency.
 *
 *  @param location - Starting location for search
 *  @param packageName - name of the package we are searching for
 *
 *  @returns location that we think is closest, which might end up being
 *           the root directory of the running environment (if no matches were found)
 */
function closestParentImporting(location, packageName) {
    const candidate = path.resolve(location, './package.json');

    try {
        const packageDefinition = JSON.parse(fs.readFileSync(candidate, 'utf-8'));
        const dependencies = packageDefinition.dependencies;
        const devDependencies = packageDefinition.devDependencies;

        if (dependencies && dependencies[packageName]) {
            return location;
        } else if (devDependencies && devDependencies[packageName]) {
            return location;
        }
    } catch (err) {
        // No luck here, continue on
    }

    // Check if we have reached the top
    if (location === path.resolve(location, '..')) {
        return location;
    }

    // Go further up the chain
    return closestParentImporting(path.resolve(location, '..'), packageName);
}

module.exports = {
    forOwnDeep: forOwnDeep,
    closestParentImporting: closestParentImporting
};
