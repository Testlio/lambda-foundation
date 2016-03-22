const _ = require('lodash');

//TODO name better
function ifOnlyCallback(arguments) {
    const lastArg = arguments[arguments.length - 1];
    return _.isFunction(lastArg) && arguments.length === 2;
}

function failTest(t, message, obj) {
    t.fail(message, obj);
    t.end();
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
        if (ifOnlyCallback(arguments)) {
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

            fail: function(err) {
                failTest(t, 'Context should succeed, failed with', err);
            },

            done: function(obj) {
                failTest(t, 'Context should succeed, done with', obj);
            }
        };
    },

    /*
    * Returns a mock context that assumes a call to context.succeed() should fail the test.
    */
    assertFail: function(t, expected, cb) {
        if (ifOnlyCallback(arguments)) {
            cb = expected;
            expected = undefined;
        }
        return {
            succeed: function(obj) {
                failTest(t, 'Context should fail, succeeded with', obj);
            },

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

            done: function(obj) {
                failTest(t, 'Context should succeed, done with', obj);
            }
        };
    },

    assertDone: function(t, expected, cb) {
        if (ifOnlyCallback(arguments)) {
            cb = expected;
            expected = undefined;
        }
        return {
            succeed: function(obj) {
                failTest(t, 'Context should finish with done, succeeded with', obj);
            },

            fail: function(err) {
                failTest(t, 'Context should finish with done, failed with', err);
            },

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
