"use strict";

const tape = require('tape');
const configuration = require('../configuration');

tape.test('Loading default configuration', function(t) {
    const resolvedConfig = configuration(__dirname + '/configs/1');
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
});

tape.test('Environment config overwrites default values', function(t) {
    const resolvedConfig = configuration(__dirname + '/configs/2');
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
});

tape.test('Environment variables mapping overwrites previous values', function(t) {
    process.env.EXAMPLE = 'env_value';
    const resolvedConfig = configuration(__dirname + '/configs/3');
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
});
