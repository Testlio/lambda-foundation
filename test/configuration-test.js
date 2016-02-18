'use strict';

const tape = require('tape');
const path = require('path');

function addDefaultConfig(config) {
    config.aws = {
        stage: undefined,
        region: undefined
    };

    config.project = {
        name: undefined
    };

    conf.url = {
        base: 'http://localhost'
    };

    return config;
}

function addDefaultConfig(conf) {
    conf.aws = {
        stage: undefined,
        region: undefined
    };

    conf.project = {
        name: undefined
    };


    return conf;
}

tape.test('Loading default configuration', function(t) {
    process.env.CONFIGURATION_DIR = path.resolve(__dirname, 'configs/1');

    delete require.cache[require.resolve('../lib/configuration')];
    const resolvedConfig = require('../lib/configuration');

    const comparison = {
        example: "value",
        nested: {
            foo: "bar",
            baz: true
        },
        array: [1, 2, 3, 4]
    };

    t.plan(1);
    t.same(resolvedConfig, addDefaultConfig(comparison), 'Default config is not loaded in properly');
});

tape.test('Environment config overwrites default values', function(t) {
    process.env.NODE_ENV = 'development';
    process.env.CONFIGURATION_DIR = path.resolve(__dirname, 'configs/2');

    delete require.cache[require.resolve('../lib/configuration')];
    const resolvedConfig = require('../lib/configuration');

    const comparison = {
        example: "different",
        nested: {
            foo: "bar",
            baz: true
        },
        array: [1, 2, 3, 4],
        development: true
    };

    t.plan(1);
    t.same(resolvedConfig, addDefaultConfig(comparison), 'Environment config is not loaded properly');
});

tape.test('Only active environment configuration is loaded', function(t) {
    process.env.NODE_ENV = 'production';
    process.env.CONFIGURATION_DIR = path.resolve(__dirname, 'configs/2');

    delete require.cache[require.resolve('../lib/configuration')];
    const resolvedConfig = require('../lib/configuration');

    const comparison = {
        example: "production",
        nested: {
            foo: "bar",
            baz: true
        },
        array: [1, 2, 3, 4],
        development: false
    };

    t.plan(1);
    t.same(resolvedConfig, addDefaultConfig(comparison), 'Environment config is not loaded properly');
});

tape.test('Environment variables mapping overwrites previous values', function(t) {
    process.env.NODE_ENV = 'development';
    process.env.EXAMPLE = 'env_value';

    process.env.CONFIGURATION_DIR = path.resolve(__dirname, 'configs/3');

    delete require.cache[require.resolve('../lib/configuration')];
    const resolvedConfig = require('../lib/configuration');

    const comparison = {
        example: "env_value",
        nested: {
            foo: "bar",
            baz: true
        },
        array: [1, 2, 3, 4],
        development: true
    };

    t.plan(1);
    t.same(resolvedConfig, addDefaultConfig(comparison), 'Environment variables are not reflected in config');
});
