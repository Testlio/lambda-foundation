'use strict';

const tape = require('tape');
const LambdaError = require('../lib/error');
const Raygun = require('../lib/error/raygun.js');
const _ = require('lodash');

// Add a TEST tag to our errors
LambdaError.config({
    tags: ['TEST']
});

tape.test('Error reporting resolves to error', function(t) {
    const code = 401;
    const message = 'A serious error happened';

    const error = new LambdaError(code, message);

    LambdaError.report(error).then(function(err) {
        t.same(err, error, 'Error is resolved');
        t.end();
    });
});

tape.test('Error sent to Raygun', function(t) {
    const expectedCode = 401;
    const expectedMessage = 'A serious error happened';
    const expectedExtra = {'id': 123};
    const expectedRequest = {'request':'caused error'};

    // The error that is sent through is a native one
    const expectedError = new Error(expectedCode + ': ' + expectedMessage);
    const error = new LambdaError(expectedCode, expectedMessage, expectedExtra, expectedRequest);

    Raygun.send = function(actualError, actualExtra, cb, actualRequest) {
        t.same(actualError, expectedError, 'Error reported to Raygun');
        t.same(actualExtra, expectedExtra, 'Extras reported to Raygun');
        t.same(actualRequest, expectedRequest, 'Request reported to Raygun');
        t.same(actualTags, ['TEST'], 'Tags reported to Raygun');
        cb();
    };

    LambdaError.report(error).then(function() {
        t.end();
    });
});

tape.test('Error sent to Raygun with additional metadata', function(t) {
    const expectedCode = 401;
    const expectedMessage = 'A serious error happened';
    const expectedExtra = {'id': 123};
    const expectedRequest = {'request':'caused error'};
    const expectedAdditionalExtra = {'more': 'foo'};

    // The error that is sent through is a native one
    const expectedError = new Error(expectedCode + ': ' + expectedMessage);
    const error = new LambdaError(expectedCode, expectedMessage, expectedExtra, expectedRequest);

    Raygun.send = function(actualError, actualExtra, cb, actualRequest, actualTags) {
        t.same(actualError, expectedError, 'Error reported to Raygun');
        t.same(actualExtra, _.merge(expectedAdditionalExtra, expectedExtra), 'Extras reported to Raygun');
        t.same(actualRequest, expectedRequest, 'Request reported to Raygun');
        t.same(actualTags, ['TEST'], 'Tags reported to Raygun');
        cb();
    };

    LambdaError.report(error, undefined, expectedAdditionalExtra).then(function() {
        t.end();
    });
});

tape.test('Error sent to Raygun with additional tags', function(t) {
    const expectedCode = 401;
    const expectedMessage = 'A serious error happened';
    const expectedExtra = {'id': 123};
    const expectedRequest = {'request':'caused error'};
    const expectedAdditionalTags = ['foo', 'bar'];

    // The error that is sent through is a native one
    const expectedError = new Error(expectedCode + ': ' + expectedMessage);
    const error = new LambdaError(expectedCode, expectedMessage, expectedExtra, expectedRequest);

    Raygun.send = function(actualError, actualExtra, cb, actualRequest, actualTags) {
        t.same(actualError, expectedError, 'Error reported to Raygun');
        t.same(actualExtra, expectedExtra, 'Extras reported to Raygun');
        t.same(actualRequest, expectedRequest, 'Request reported to Raygun');
        t.same(actualTags, ['TEST'].concat(expectedAdditionalTags), 'Tags reported to Raygun');
        cb();
    };

    LambdaError.report(error, expectedAdditionalTags).then(function() {
        t.end();
    });
});

tape.test('Error reporting failure resolves to error', function(t) {
    const expectedCode = 401;
    const expectedMessage = 'A serious error happened';

    // The error that is sent through is a native one
    const expectedError = new Error(expectedCode + ': ' + expectedMessage);

    Raygun.send = {};

    LambdaError.report(expectedError).then(function(actualError) {
        t.same(actualError, expectedError, 'Error reported to Raygun');
        t.end();
    });
});
