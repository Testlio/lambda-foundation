'use strict';

const util = require('../util.js');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');

function loadConfig(file) {
    try {
        return JSON.parse(fs.readFileSync(file));
    } catch (err) {
        return {};
    }
}

function loadEnvironmentVariablesConfig(file) {
    try {
        const envVarsMapping = JSON.parse(fs.readFileSync(file));
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
//  configuration files are located (typically CWD + '/config')
//
//  It is worth noting that once browserified, the root location is ignored
//  and is assumed to be whatever the CWD + '/config' was during bundling.
//
module.exports = function(configurationDirectory) {
    // Try deriving some common config attributes from the environment
    const config = {
        project: {
            name: process.env.AWS_PROJECT_NAME
        },

        url: {
            // Base URL is read from ENV, or overwritten by configuration file or finally a default is used
            base: process.env.BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://api.testlio.com' : 'http://localhost')
        },

        aws: {
            stage: process.env.AWS_STAGE,
            region: process.env.AWS_REGION
        }
    };

    // Always load in default as our go-to fallback
    const defaultConfig = loadConfig(path.resolve(configurationDirectory, 'default.json'));

    // Load env specific conf
    const environment = process.env.NODE_ENV || 'development';
    const environmentConfig = loadConfig(path.resolve(configurationDirectory, environment + '.json'));

    // Check if there are env vars that need to be mapped
    const envVarsConfig = loadEnvironmentVariablesConfig(path.resolve(configurationDirectory, 'custom-environment-variables.json'));

    // Return the combined configuration
    return _.merge(config, defaultConfig, environmentConfig, envVarsConfig);
};
