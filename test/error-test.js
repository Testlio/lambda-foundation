'use strict';

const tape = require('tape');
const Error = require('../lib/error');
const Raygun = require('../lib/error/raygun.js');

// Add a TEST tag to our errors
Error.config({
    tags: ['TEST']
});

tape.test('Error reporting resolves to error', function(t) {
    const code = 401;
    const message = 'A serious error happened';

    const error = new Error.error(code, message);

    Error.report(error).then(function(err) {
        t.same(err, error, 'Error is resolved');
        t.end();
    });
});

tape.test('Error sent to Raygun', function(t) {
    const expectedCode = 401;
    const expectedMessage = 'A serious error happened';
    const expectedExtra = {'id': 123};
    const expectedRequest = {'request':'caused error'};

    const expectedError = new Error.error(expectedCode, expectedMessage, expectedExtra, expectedRequest);

    Raygun.send = function(actualError, actualExtra, cb, actualRequest) {
        t.same(actualError, expectedError, 'Error reported to Raygun');
        t.equal(actualExtra, expectedError.extra, 'Extras reported to Raygun');
        t.equal(actualRequest, expectedError.request, 'Request reported to Raygun');
        cb();
    };

    Error.report(expectedError).then(function() {
        t.end();
    });
});

tape.test('Error reporting failure resolves to error', function(t) {
    const expectedCode = 401;
    const expectedMessage = 'A serious error happened';

    const expectedError = new Error.error(expectedCode, expectedMessage);

    Raygun.send = {};

    Error.report(expectedError).then(function(actualError) {
        t.same(actualError, expectedError, 'Error reported to Raygun');
        t.end();
    });
});
