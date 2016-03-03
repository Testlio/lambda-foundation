'use strict';

const _ = require('lodash');
const path = require('path');
const fs = require('fs');

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

//
// Helper function for locating the closest directory containing
// a package.json that lists a package as a (dev) dependency
//
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
