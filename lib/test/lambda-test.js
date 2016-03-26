'use strict';
const Event = require('./event');
const Error = require('../error');
const ctx = require('./mock-context');
const test = require('tape');
const sandbox = require('sinon').sandbox;

function testAuthorization(lambda, error) {
    const expectedError = error || new Error('401', 'Invalid token');

    const tester = this;
    tester.test('Should fail if authorization token invalid', function(t) {
        const event = Event.unauthorized();
        const context = ctx.assertFail(t, expectedError);

        lambda.handler(event, context);
    });
}

module.exports = {
    test: function(groupName, options, callback) {
        let box;

        test(groupName + ' - Set up', function(t) {
            box = sandbox.create();
            t.testAuthorization = testAuthorization;
            callback(box, t);
            t.end();
        });

        test(groupName + ' - Tear down', function(t) {
            box.restore();
            t.end();
        });
    }
};
