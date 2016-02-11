var _ = require('lodash');
var path = require('path');

function loadDefaultConfig(rootDirectory) {
    try {
        return require(path.resolve(rootDirectory, 'config/default.json'));
    } catch (err) {
        // Ignore (this is so we don't have to dynamically check for file existance)
    }

    return {};
}

function loadEnvironmentConfig(environment, rootDirectory) {
    if (["development", "production", "docker"].indexOf(environment) !== -1) {
        try {
            return require(path.resolve(rootDirectory, 'config/' + environment + '.json'));
        } catch (err) {
            // Ignore (this is so we don't have to dynamically check for file existance)
        }
    }

    return {};
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

function loadEnvironmentVariablesConfig(rootDirectory) {
    try {
        var envVarsMapping = require(path.resolve(rootDirectory, 'config/custom-environment-variables.json'));
        var envConfig = {};

        forOwnDeep(envVarsMapping, function(value, key) {
            if (process.env[value]) {
                _.set(envConfig, key, process.env[value]);
            }
        });

        return envConfig;
    } catch (err) {
        // Ignore (this is so we don't have to dynamically check for file existance)
    }

    return {};
}

module.exports = function(rootDirectory) {
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
    var defaultConfig = loadDefaultConfig(rootDirectory);

    // Load env specific conf
    var environmentConfig = loadEnvironmentConfig(process.env.NODE_ENV || 'development', rootDirectory);

    // Check if there are env vars that need to be mapped
    var envVarsConfig = loadEnvironmentVariablesConfig(rootDirectory);

    return _.merge({}, config, defaultConfig, environmentConfig, envVarsConfig);
};
