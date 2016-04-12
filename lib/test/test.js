'use strict';
const Event = require('./event');
const Error = require('../error');
const auth = require('../authentication');
const ctx = require('./context');
const test = require('tape');
const sandbox = require('sinon').sandbox;
const _ = require('lodash');

/**
 * @param object lambda - the lambda to test
 * @param object error - (optional) the error the lambda call is expected to fail with.
 *                       If no error is passe, the default new Error('401', 'Invalid token') is used.
 */
function testAuthorization(lambda, error) {
    const expectedError = error || new Error('401', 'Invalid token');

    const tester = this;
    tester.test('Should fail if authorization token invalid', function(t) {
        const event = Event().unauthorized();
        const context = ctx.assertFail(t, expectedError);

        lambda.handler(event, context);
    });
}

module.exports = {
    test: function(groupName, options, callback) {
        let box;

        if (_.isFunction(options)) {
            callback = options;
            options = {};
        }

        options = _.assign({}, options);

        test(groupName + ' - Set up', function(t) {
            box = sandbox.create();

            if (options.defaultAuth) {
                auth.config({
                    secret: 'default_secret'
                });
            }

            t.testAuthorization = testAuthorization;
            callback(box, t);
            t.end();
        });

        test(groupName + ' - Tear down', function(t) {
            if (options.defaultAuth) {
                auth.config({
                    secret: undefined
                });
            }

            box.restore();
            t.end();
        });
    }
};
