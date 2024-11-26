'use strict';

const tape = require('tape');
const LambdaError = require('../lib/error');
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

tape.test('Error reporting with additional metadata', function(t) {
    const expectedCode = 401;
    const expectedMessage = 'A serious error happened';
    const expectedExtra = {'id': 123};
    const expectedRequest = {'request':'caused error'};
    const expectedAdditionalExtra = {'more': 'foo'};

    const error = new LambdaError(expectedCode, expectedMessage, expectedExtra, expectedRequest);

    LambdaError.report(error, undefined, expectedAdditionalExtra).then(function(err) {
        const mergedExtra = _.merge({}, expectedExtra, expectedAdditionalExtra);
        t.same(err.extra, mergedExtra, 'Extra metadata merged correctly');
        t.same(err.request, expectedRequest, 'Request data preserved');
        t.end();
    });
});

tape.test('Error reporting with additional tags', function(t) {
    const expectedCode = 401;
    const expectedMessage = 'A serious error happened';
    const expectedExtra = {'id': 123};
    const expectedRequest = {'request':'caused error'};
    const expectedAdditionalTags = ['foo', 'bar'];

    const error = new LambdaError(expectedCode, expectedMessage, expectedExtra, expectedRequest);

    LambdaError.report(error, expectedAdditionalTags).then(function(err) {
        t.same(err.extra, expectedExtra, 'Extra metadata preserved');
        t.same(err.request, expectedRequest, 'Request data preserved');
        t.end();
    });
});
