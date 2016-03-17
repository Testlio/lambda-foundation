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
    // Load default env related config
    const envConfig = {
        project: {
            name: process.env.AWS_PROJECT_NAME
        },

        url: {
            base: process.env.BASE_URL
        },

        aws: {
            stage: process.env.AWS_STAGE,
            region: process.env.AWS_REGION
        }
    };

    try {
        const envVarsMapping = JSON.parse(fs.readFileSync(file));

        util.forOwnDeep(envVarsMapping, function(value, key) {
            if (process.env[value]) {
                _.set(envConfig, key, process.env[value]);
            }
        });
    } catch (err) {
        // Ignore
    }

    return envConfig;
}

// Load configurations, then export the combination
const locatedConfigurationDirectory = path.resolve(util.closestParentImporting(process.cwd(), '@testlio/lambda-foundation'), 'config');
const configurationDirectory = process.env.LAMBDA_CONFIGURATION_DIR || locatedConfigurationDirectory;
const defaultConfig = loadConfig(path.resolve(configurationDirectory, 'default.json'));
const environment = process.env.NODE_ENV || 'development';
const environmentConfig = loadConfig(path.resolve(configurationDirectory, environment + '.json'));
const envVarsConfig = loadEnvironmentVariablesConfig(path.resolve(configurationDirectory, 'custom-environment-variables.json'));

/**
 *  Export the "compiled" configurations as a single result,
 *  this way it is enough to simply require this module to get the configuration
 */
module.exports = _.merge({}, defaultConfig, environmentConfig, envVarsConfig);
