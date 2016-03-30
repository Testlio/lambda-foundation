'use strict';

const tape = require('tape');
const LambdaError = require('../lib/error');
const Raygun = require('../lib/error/raygun.js');

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

    Raygun.send = function(actualError, actualExtra, cb, actualRequest) {
        t.same(actualError, expectedError, 'Error reported to Raygun');
        t.equal(actualExtra, expectedError.extra, 'Extras reported to Raygun');
        t.equal(actualRequest, expectedError.request, 'Request reported to Raygun');
        cb();
    };

    LambdaError.report(expectedError).then(function() {
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
