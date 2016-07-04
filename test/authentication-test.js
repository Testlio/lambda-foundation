'use strict';

const tape = require('tape');
const auth = require('../lib/authentication');
const test = require('../lib/test');

tape.test('If no token then return 401', function(t) {

    try {
        auth.isValidToken();

        t.fail('didn\'t throw error');
        t.end();
    } catch (err) {
        t.ok(err, 'error is returned');
        t.equal(err.code, '401');
        t.end();
    }
});

tape.test('If invalid token then return 401', function(t) {

    try {
        auth.isValidToken('foo');
        t.fail('didn\'t throw error');
        t.end();
    } catch (err) {
        t.ok(err, 'error is returned');
        t.equal(err.code, '401');
        t.end();
    }
});

tape.test('If valid token then return decoded token', function(t) {

    try {
        const decoded = auth.isValidToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QHRlc3QuY29tIiwic2NvcGUiOlsidGVzdGVyIl19.ZzBZRdxQHFemCW2TwwFRn8Jk-uWt-OLtsi6O5pWpM34');
        t.equal(decoded.sub, 'test@test.com');
        t.end();
    } catch (err) {
        t.fail('should not throw error: ' + err);
        t.end();
    }
});

tape.test('If valid token with altered secret then return decoded token', function(t) {

    try {
        // Change the configuration
        auth.config({
            secret: 'test_secret'
        });

        // Use the test submodule for token generation
        const token = test.event().authorized({ sub: 'test@test.com' }, 'test_secret').authorization;
        const decoded = auth.isValidToken(token);

        // Restore auth configuration
        auth.config({
            secret: null
        });

        t.equal(decoded.sub, 'test@test.com');
        t.end();
    } catch (err) {
        t.fail('should not throw error: ' + err);
        t.end();
    }
});

tape.test('If valid token with Bearer keyword then return decoded token', function(t) {

    try {
        const decoded = auth.isValidToken('Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QHRlc3QuY29tIiwic2NvcGUiOlsidGVzdGVyIl19.ZzBZRdxQHFemCW2TwwFRn8Jk-uWt-OLtsi6O5pWpM34');
        t.equal(decoded.sub, 'test@test.com');
        t.end();
    } catch (err) {
        t.fail('should not throw error: ' + err);
        t.end();
    }
});

tape.test('if all roles not present with no rules then return false', function(t) {

    const result = auth.isAuthorized({}, {
        scope: ['client', 'admin']
    });

    t.notOk(result, 'false expected');
    t.end();
});

tape.test('if all roles are present with no rules then return true', function(t) {

    const authPromise = auth.isAuthorized({ scope: ['client', 'admin'] }, {
        scope: ['client', 'admin']
    });

    t.ok(authPromise, 'true expected');
    t.end();
});

tape.test('if all roles are not present with no rule then return false', function(t) {

    const authPromise = auth.isAuthorized({ scope: ['admin'] }, {
        scope: ['client', 'admin']
    });

    t.notOk(authPromise, 'true expected');
    t.end();
});

tape.test('if at least one role is present with Any rule then return true', function(t) {

    const authPromise = auth.isAuthorized({ scope: ['admin'] }, {
        scope: ['admin', 'client'],
        rule: auth.RULE.ANY
    });

    t.ok(authPromise, 'true expected');
    t.end();
});

tape.test('if no roles are present with Any rule then return false', function(t) {

    const authPromise = auth.isAuthorized({ scope: [] }, {
        scope: ['admin', 'client'],
        rule: auth.RULE.ANY
    });

    t.notOk(authPromise, 'false expected');
    t.end();
});

tape.test('if at least one role is present with None rule then return false', function(t) {

    const authPromise = auth.isAuthorized({ scope: ['admin'] }, {
        scope: ['admin', 'client'],
        rule: auth.RULE.NONE
    });

    t.notOk(authPromise, 'false expected');
    t.end();
});

tape.test('if no unallowed roles present with None rule then return true', function(t) {

    const authPromise = auth.isAuthorized({ scope: ['admin'] }, {
        scope: ['client'],
        rule: auth.RULE.NONE
    });

    t.ok(authPromise, 'true expected');
    t.end();
});

tape.test('if valid token and valid scope then resolve decoded token', function(t) {

    const expectedDecodedToken = {
        'sub': 'test@test.com',
        'scope': [
            'tester'
        ]
    };

    const authPromise = auth.authenticate('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QHRlc3QuY29tIiwic2NvcGUiOlsidGVzdGVyIl19.ZzBZRdxQHFemCW2TwwFRn8Jk-uWt-OLtsi6O5pWpM34', {
        scope: ['admin'],
        rule: auth.RULE.NONE
    });

    authPromise.then(function(decodedToken) {
        t.deepEqual(expectedDecodedToken, decodedToken, 'decoded token doesn\'t match');
        t.end();
    }).catch(function(err) {
        t.fail(err.message);
        t.end();
    });
});

tape.test('if invalid token and valid scope then reject', function(t) {

    const authPromise = auth.authenticate('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QHRlc3QuY29tIiwic2NvcGUiOlsidGVzdGVyIl19.ZzBZRdxQHFemCW2TwwFRn8Jk-uWt-OLtsi6O5pWpM34' + 'foo', {
        scope: ['tester'],
        rule: auth.RULE.NONE
    });

    authPromise.then(function() {
        t.fail('didn\'t throw error');
        t.end();
    }).catch(function(err) {
        t.ok(err, 'error is returned');
        t.equal(err.code, '401');
        t.end();
    });
});

tape.test('if valid token and invalid scope then reject', function(t) {

    const authPromise = auth.authenticate('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QHRlc3QuY29tIiwic2NvcGUiOlsidGVzdGVyIl19.ZzBZRdxQHFemCW2TwwFRn8Jk-uWt-OLtsi6O5pWpM34', {
        scope: ['admin']
    });

    authPromise.then(function() {
        t.fail('didn\'t throw error');
        t.end();
    }).catch(function(err) {
        t.ok(err, 'error is returned');
        t.equal(err.code, '403');
        t.end();
    });
});
