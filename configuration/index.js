"use strict";

const _ = require('lodash');
const fs = require('fs');
const Path = require('path');

function loadDefaultConfig(root) {
    try {
        const path = Path.resolve(root, 'default.json');
        return JSON.parse(fs.readFileSync(path));
    } catch (err) {
        console.log(err);
        return {};
    }
}

function loadEnvironmentConfig(environment, root) {
    try {
        const path = Path.resolve(root, environment + '.json');
        return JSON.parse(fs.readFileSync(path));
    } catch (err) {
        return {};
    }
}

function forOwnDeep(object, callback, prefix) {
    prefix = prefix ? prefix + '.' : '';

    _.forOwn(object, function(value, key) {
        if (_.isString(value)) {
            callback(value, prefix + key);
        } else {
            forOwnDeep(value, callback, prefix);
        }
    });
}

function loadEnvironmentVariablesConfig(root) {
    try {
        const path = Path.resolve(root, 'custom-environment-variables.json');
        const envVarsMapping = JSON.parse(fs.readFileSync(path));
        const envConfig = {};

        forOwnDeep(envVarsMapping, function(value, key) {
            if (process.env[value]) {
                _.set(envConfig, key, process.env[value]);
            }
        });

        return envConfig;
    } catch (err) {
        return {};
    }
}

module.exports = function(root) {
    // Try deriving some common config attributes from the environment
    var config = {
        project: {
            name: process.env.AWS_PROJECT_NAME,
        },

        aws: {
            stage: process.env.AWS_STAGE,
            region: process.env.AWS_REGION
        }
    };

    // Always load in default as our go-to fallback
    var defaultConfig = loadDefaultConfig(root);

    // Load env specific conf
    var environmentConfig = loadEnvironmentConfig(process.env.NODE_ENV || 'development', root);

    // Check if there are env vars that need to be mapped
    var envVarsConfig = loadEnvironmentVariablesConfig(root);
    return _.merge(config, defaultConfig, environmentConfig, envVarsConfig);
};
