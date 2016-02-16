'use strict';

const raygunStub = {
    'raygun': {
        'Client': function() {
            let init = function() {
                return {
                    send: function(err, data, cb, tags) {
                        cb();
                    }
                };
            };
            return {init};
        }
    }
}

const proxyquire = require('proxyquire');
const tape = require('tape');
const Error = require('../lib/error')(['test tag']);
const Reporter = proxyquire('../lib/error/reporter.js', raygunStub);

tape.test('test Raygun reporting', function(t) {
    let code = 401;
    let message = 'serious error happened';

    Error.report(new Error.error(code, message)).then(function(err) {
            t.equal(err.message, code + ': ' + message, 'Error is correct');
            t.end();
        }
    );
});
