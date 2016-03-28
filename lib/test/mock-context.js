const _ = require('lodash');

function isExpectedUndefined(arguments) {
    const lastArg = arguments[arguments.length - 1];
    return _.isFunction(lastArg) && arguments.length === 2;
}

/*
* Fails and ends the current test with an appropriate message
*/
function failTest(t, message) {
    return function(result) {
        t.fail(message + ' ' + JSON.stringify(result));
        t.end();
    };
}

function done(err, obj) {
    if (err) {
        return this.fail(err);
    }
    if (obj) {
        return this.succeed(obj);
    }
}

/*
* Helper module for creating mock context for lambda testing.
* Handles failing the test if wrong function called.
* Also handles ending the test.
*/
module.exports = {
    assertSucceed: function(t, expected, cb) {
        if (isExpectedUndefined(arguments)) {
            cb = expected;
            expected = undefined;
        }
        return {
            succeed: function(obj) {
                t.ok(true, 'Context finished with succeed');
                if (expected) {
                    t.same(obj, expected, 'Context succeeded with expected result');
                }
                if(cb) {
                    cb(obj);
                }
                t.end();
            },

            fail: failTest(t, 'Context should succeed, failed with'),

            done: done
        };
    },

    assertFail: function(t, expected, cb) {
        if (isExpectedUndefined(arguments)) {
            cb = expected;
            expected = undefined;
        }
        return {
            fail: function(err) {
                t.ok(true, 'Context finished with failure');
                if (expected) {
                    t.same(err, expected, 'Context failed with expected result');
                }
                if(cb) {
                    cb(err);
                }
                t.end();
            },

            succeed: failTest(t, 'Context should fail, succeeded with'),

            done: done
        };
    }
};
