'use strict';
const Event = require('./event');
const Error = require('../error');
const ctx = require('./mock-context');
const test = require('tape');
const sandbox = require('sinon').sandbox;
const defaultTimeout = 3000;

module.exports = {
    test: function(groupName, options, callback) {
        if (Function.prototype.isPrototypeOf(options)) {
            options = {};
        } else {
            options = options || {};
        }

        options.timeout = options.timeout || defaultTimeout;
        callback = callback || Array.prototype.slice.call(arguments).slice(-1)[0];

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

function testAuthorization(lambda, error) {
    const expectedError = error || new Error('401', 'Invalid token');

    const tester = this;
    tester.test('Should fail if invalid authorization token', function(t) {
        const event = Event.unauthorized();
        const context = ctx.assertFail(t, expectedError);

        lambda.handler(event, context);
    });
}
