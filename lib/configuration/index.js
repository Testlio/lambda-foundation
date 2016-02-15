'use strict';

const util = require('../util.js');
const _ = require('lodash');
const fs = require('fs');
const Path = require('path');

function loadDefaultConfig(root) {
    try {
        const path = Path.resolve(root, 'default.json');
        return JSON.parse(fs.readFileSync(path));
    } catch (err) {
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

function loadEnvironmentVariablesConfig(root) {
    try {
        const path = Path.resolve(root, 'custom-environment-variables.json');
        const envVarsMapping = JSON.parse(fs.readFileSync(path));
        const envConfig = {};

        util.forOwnDeep(envVarsMapping, function(value, key) {
            if (process.env[value]) {
                _.set(envConfig, key, process.env[value]);
            }
        });

        return envConfig;
    } catch (err) {
        return {};
    }
}

//
//  To load configuration, you need to pass in the root directory of where the
//  configuration files are located.
//
module.exports = function(root) {
    // Try deriving some common config attributes from the environment
    const config = {
        project: {
            name: process.env.AWS_PROJECT_NAME
        },

        aws: {
            stage: process.env.AWS_STAGE,
            region: process.env.AWS_REGION
        }
    };

    // Always load in default as our go-to fallback
    const defaultConfig = loadDefaultConfig(root);

    // Load env specific conf
    const environmentConfig = loadEnvironmentConfig(process.env.NODE_ENV || 'development', root);

    // Check if there are env vars that need to be mapped
    const envVarsConfig = loadEnvironmentVariablesConfig(root);
    return _.merge(config, defaultConfig, environmentConfig, envVarsConfig);
};
