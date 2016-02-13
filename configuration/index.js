var _ = require('lodash');
var fs = require('fs');

function loadDefaultConfig() {
    try {
        var path = path.resolve(process.cwd(), 'config/default.json');
        return JSON.parse(fs.readFileSync(path));
    } catch (err) {
        // Ignore (this is so we don't have to dynamically check for file existance)
    }

    return {};
}

function loadEnvironmentConfig(environment) {
    try {
        var path = path.resolve(process.cwd(), 'config/' + environment + '.json');
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

function loadEnvironmentVariablesConfig() {
    try {
        var path = path.resolve(process.cwd(), 'config/custom-environment-variables.json');
        var envVarsMapping = JSON.parse(fs.readFileSync(path));
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

module.exports = function() {
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
    var defaultConfig = loadDefaultConfig();

    // Load env specific conf
    var environmentConfig = loadEnvironmentConfig(process.env.NODE_ENV || 'development');

    // Check if there are env vars that need to be mapped
    var envVarsConfig = loadEnvironmentVariablesConfig();

    console.log('Modified internal');
    console.log('Configs', config, defaultConfig, environmentConfig, envVarsConfig);
    return _.merge(config, defaultConfig, environmentConfig, envVarsConfig);
};
