'use strict';

const tape = require('tape');
const auth = require('../lib/authentication');

tape.test('If no token then return 401', function(t) {

    try {
        auth.isValidToken();

        t.fail('didn\'t throw error');
        t.end();
    } catch (err) {
        t.ok(err, 'error is returned');
        t.equal('401', err.code);
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
        t.equal('401', err.code);
        t.end();
    }
});

tape.test('If valid token then return decoded token', function(t) {

    try {
        const decoded = auth.isValidToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QHRlc3QuY29tIiwic2NvcGVzIjpbInRlc3RlciJdfQ.MjK579tyUaxtY9FXpTktC-vssI-rOS1RNsGl8KWX9mM');
        t.equal('test@test.com', decoded.sub);
        t.end();
    } catch (err) {
        t.fail('should not throw error: ' + err);
        t.end();
    }
});

tape.test('If valid token with Bearer keyword then return decoded token', function(t) {

    try {
        const decoded = auth.isValidToken('Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QHRlc3QuY29tIiwic2NvcGVzIjpbInRlc3RlciJdfQ.MjK579tyUaxtY9FXpTktC-vssI-rOS1RNsGl8KWX9mM');
        t.equal('test@test.com', decoded.sub);
        t.end();
    } catch (err) {
        t.fail('should not throw error: ' + err);
        t.end();
    }
});

tape.test('if all roles not present with no rules then return false', function(t) {

    const result = auth.isAuthorized({}, {
        scope: [auth.SCOPE.CLIENT, auth.SCOPE.ADMIN]
    });

    t.notOk(result, 'false expected');
    t.end();
});

tape.test('if all roles are present with no rules then return true', function(t) {

    const authPromise = auth.isAuthorized({ scope: [auth.SCOPE.CLIENT, auth.SCOPE.ADMIN] }, {
        scope: [auth.SCOPE.CLIENT, auth.SCOPE.ADMIN]
    });

    t.ok(authPromise, 'true expected');
    t.end();
});

tape.test('if all roles are not present with no rule then return false', function(t) {

    const authPromise = auth.isAuthorized({ scope: [auth.SCOPE.ADMIN] }, {
        scope: [auth.SCOPE.CLIENT, auth.SCOPE.ADMIN]
    });

    t.notOk(authPromise, 'true expected');
    t.end();
});

tape.test('if at least one role is present with Any rule then return true', function(t) {

    const authPromise = auth.isAuthorized({ scope: [auth.SCOPE.ADMIN] }, {
        scope: [auth.SCOPE.ADMIN, auth.SCOPE.CLIENT],
        rule: auth.RULE.ANY
    });

    t.ok(authPromise, 'true expected');
    t.end();
});

tape.test('if no roles are present with Any rule then return false', function(t) {

    const authPromise = auth.isAuthorized({ scope: [] }, {
        scope: [auth.SCOPE.ADMIN, auth.SCOPE.CLIENT],
        rule: auth.RULE.ANY
    });

    t.notOk(authPromise, 'false expected');
    t.end();
});

tape.test('if at least one role is present with None rule then return false', function(t) {

    const authPromise = auth.isAuthorized({ scope: [auth.SCOPE.ADMIN] }, {
        scope: [auth.SCOPE.ADMIN, auth.SCOPE.CLIENT],
        rule: auth.RULE.NONE
    });

    t.notOk(authPromise, 'false expected');
    t.end();
});

tape.test('if no unallowed roles present with None rule then return true', function(t) {

    const authPromise = auth.isAuthorized({ scope: [auth.SCOPE.ADMIN] }, {
        scope: [auth.SCOPE.CLIENT],
        rule: auth.RULE.NONE
    });

    t.ok(authPromise, 'true expected');
    t.end();
});

tape.test('if valid token and valid scope then return true', function(t) {

    const authPromise = auth.authenticate('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QHRlc3QuY29tIiwic2NvcGVzIjpbInRlc3RlciJdfQ.MjK579tyUaxtY9FXpTktC-vssI-rOS1RNsGl8KWX9mM', {
        scope: [auth.SCOPE.ADMIN],
        rule: auth.RULE.NONE
    });

    t.ok(authPromise, 'true expected');
    t.end();
});

tape.test('if invalid token and valid scope then false', function(t) {

    const authPromise = auth.authenticate('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QHRlc3QuY29tIiwic2NvcGVzIjpbInRlc3RlciJdfQ.MjK579tyUaxtY9FXpTktC-vssI-rOS1RNsGl8KWX9mM' + 'foo', {
        scope: [auth.SCOPE.ADMIN],
        rule: auth.RULE.NONE
    });

    authPromise.then(function() {
        t.fail('didn\'t throw error');
        t.end();
    }).catch(function(err) {
        t.ok(err, 'error is returned');
        t.equal('401', err.code);
        t.end();
    });
});

tape.test('if valid token and invalid scope then false', function(t) {

    const authPromise = auth.authenticate('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QHRlc3QuY29tIiwic2NvcGVzIjpbInRlc3RlciJdfQ.MjK579tyUaxtY9FXpTktC-vssI-rOS1RNsGl8KWX9mM', {
        scope: [auth.SCOPE.TESTER]
    });

    authPromise.then(function() {
        t.fail('didn\'t throw error');
        t.end();
    }).catch(function(err) {
        t.ok(err, 'error is returned');
        t.equal('403', err.code);
        t.end();
    });
});
