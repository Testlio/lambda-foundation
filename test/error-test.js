'use strict';

const tape = require('tape');
const Error = require('../lib/error')(['TEST']);
const Raygun = require('../lib/error/raygun.js');

tape.test('Error reporting resolves to error', function(t) {
    let code = 401;
    let message = 'A serious error happened';

    let error = new Error.error(code, message);

    Error.report(error).then(function(err) {
            t.same(err, error, 'Error is resolved');
            t.end();
        }
    );
});

tape.test('Error sent to Raygun', function(t) {
    let code = 401;
    let message = 'A serious error happened';
    let extra = {'id': 123};
    let request = {'request':'caused error'}

    let expectedError = new Error.error(code, message, extra, request);

    Raygun.send = function(actualError, extra, cb, request, tags) {
        t.same(expectedError, actualError, 'Error reported to Raygun');
        t.equal(expectedError.extra, extra, 'Extras reported to Raygun');
        t.equal(expectedError.request, request, 'Request reported to Raygun');
        cb();
    };

    Error.report(expectedError).then(function(err) {
            t.end();
        }
    );
});

tape.test('Error reporting failure resolves to error', function(t) {
    let code = 401;
    let message = 'A serious error happened';

    let expectedError = new Error.error(code, message);

    Raygun.send = {};

    Error.report(expectedError).then(function(actualError) {
            t.same(expectedError, actualError, 'Error reported to Raygun');
            t.end();
        }
    );
});
