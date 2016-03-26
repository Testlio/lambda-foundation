const _ = require('lodash');

function isExpectedUndefined(arguments) {
    const lastArg = arguments[arguments.length - 1];
    return _.isFunction(lastArg) && arguments.length === 2;
}

/*
* Fails and ends the current test with an appropriate message
*/
function failTest(t, message, obj) {
    return function() {
        t.fail(message + ' ' + JSON.stringify(obj));
        t.end();
    };
}


/*
* Helper module for creating mock context for lambda testing.
* Handles failing the test if wrong function called.
* Also handles ending the test.
*/
/*eslint-disable no-console */
module.exports = {
    /*
    * Returns a mock context that assumes a call to context.fail() should fail the test.
    */
    assertSucceed: function(t, expected, cb) {
        if (isExpectedUndefined(arguments)) {
            cb = expected;
            expected = undefined;
        }
        return {
            succeed: function(obj) {
                t.ok(obj, 'Context finished with succeed');
                if (expected) {
                    t.same(obj, expected, 'Context succeeded with expected result');
                }
                if(cb) {
                    cb(obj);
                }
                t.end();
            },

            fail: failTest(t, 'Context should succeed, failed with', arguments[1]),

            done: failTest(t, 'Context should succeed, done called with', arguments[1])
        };
    },

    /*
    * Returns a mock context that assumes a call to context.succeed() should fail the test.
    */
    assertFail: function(t, expected, cb) {
        if (isExpectedUndefined(arguments)) {
            cb = expected;
            expected = undefined;
        }
        return {
            fail: function(err) {
                t.ok(err, 'Context finished with failure');
                if (expected) {
                    t.same(err, expected, 'Context failed with expected result');
                }
                if(cb) {
                    cb(err);
                }
                t.end();
            },

            succeed: failTest(t, 'Context should fail, succeeded with', arguments[1]),

            done: failTest(t, 'Context should succeed, done with', arguments[1])
        };
    },

    assertDone: function(t, expected, cb) {
        if (isExpectedUndefined(arguments)) {
            cb = expected;
            expected = undefined;
        }
        return {
            succeed: failTest(t, 'Context should finish with done, succeeded with', arguments[1]),

            fail: failTest(t, 'Context should finish with done, failed with', arguments[1]),

            done: function(obj) {
                t.ok(obj, 'Context finished with done');
                if (expected) {
                    t.same(obj, expected, 'Context done with expected result');
                }
                if(cb) {
                    cb(obj);
                }
                t.end();
            }
        };
    }
};
