'use strict';

const tape = require('tape');
const path = require('path');

tape.test('Loading default configuration', function(t) {
    process.env.CONFIGURATION_DIR = path.resolve(__dirname, 'configs/1');
    const resolvedConfig = require('../lib/configuration');
    const comparison = {
        example: "value",
        nested: {
            foo: "bar",
            baz: true
        },
        array: [1, 2, 3, 4]
    };

    // The additional values that the config implicitly adds
    comparison.aws = {
        stage: undefined,
        region: undefined
    };

    comparison.project = {
        name: undefined
    };

    t.plan(1);
    t.same(resolvedConfig, comparison, 'Default config is not loaded in properly');

    delete require.cache[require.resolve('../lib/configuration')];
});

tape.test('Environment config overwrites default values', function(t) {
    process.env.CONFIGURATION_DIR = path.resolve(__dirname, 'configs/2');
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

    // The additional values that the config implicitly adds
    comparison.aws = {
        stage: undefined,
        region: undefined
    };

    comparison.project = {
        name: undefined
    };

    t.plan(1);
    t.same(resolvedConfig, comparison, 'Environment config is not loaded properly');

    delete require.cache[require.resolve('../lib/configuration')];
});

tape.test('Only active environment configuration is loaded', function(t) {
    process.env.NODE_ENV = 'production';
    process.env.CONFIGURATION_DIR = path.resolve(__dirname, 'configs/2');
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

    // The additional values that the config implicitly adds
    comparison.aws = {
        stage: undefined,
        region: undefined
    };

    comparison.project = {
        name: undefined
    };

    t.plan(1);
    t.same(resolvedConfig, comparison, 'Environment config is not loaded properly');

    delete require.cache[require.resolve('../lib/configuration')];
});

tape.test('Environment variables mapping overwrites previous values', function(t) {
    process.env.NODE_ENV = 'development';
    process.env.EXAMPLE = 'env_value';

    process.env.CONFIGURATION_DIR = path.resolve(__dirname, 'configs/3');
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

    // The additional values that the config implicitly adds
    comparison.aws = {
        stage: undefined,
        region: undefined
    };

    comparison.project = {
        name: undefined
    };

    t.plan(1);
    t.same(resolvedConfig, comparison, 'Environment variables are not reflected in config');

    delete require.cache[require.resolve('../lib/configuration')];
});
