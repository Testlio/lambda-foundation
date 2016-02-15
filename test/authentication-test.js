const tape = require('tape');
const auth = require('../authentication/authentication');

tape.test('If no token then return 401', function(t) {

    const authPromise = auth.validateToken();

    authPromise.then(function(decoded) {
        t.fail('didn\'t throw error');
        t.end();
    }).catch(function(err) {
        t.ok(err, 'error is returned');
        t.equal('401', err.code);
        t.end();
    })
});

tape.test('If invalid token then return 401', function(t) {

    const authPromise = auth.validateToken('foo');

    authPromise.then(function(decoded) {
        t.fail('didn\'t throw error');
        t.end();
    }).catch(function(err) {
        t.ok(err, 'error is returned');
        t.equal('401', err.code);
        t.end();
    })
});

tape.test('If valid token then return decoded token', function(t) {

    const authPromise = auth.validateToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QHRlc3QuY29tIiwic2NvcGVzIjpbInRlc3RlciJdfQ.MjK579tyUaxtY9FXpTktC-vssI-rOS1RNsGl8KWX9mM');

    authPromise.then(function(decoded) {
        t.equal('test@test.com', decoded.sub);
        t.end();
    }).catch(function(err) {
        t.fail('should not throw error: ' + err);
        t.end();
    })
});

tape.test('If valid token with Bearer keyword then return decoded token', function(t) {

    const authPromise = auth.validateToken('Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QHRlc3QuY29tIiwic2NvcGVzIjpbInRlc3RlciJdfQ.MjK579tyUaxtY9FXpTktC-vssI-rOS1RNsGl8KWX9mM');

    authPromise.then(function(decoded) {
        t.equal('test@test.com', decoded.sub);
        t.end();
    }).catch(function(err) {
        t.fail('should not throw error: ' + err);
        t.end();
    })
});

tape.test('if all roles not present with no rules then return false', function(t) {

    const result = auth.isAuthorized([], {
        scope: [auth.scope.client, auth.scope.admin]
    });

    t.notOk(result, 'false expected');
    t.end();
});

tape.test('if all roles are present with no rules then return true', function(t) {

    const authPromise = auth.isAuthorized(['client', 'admin'], {
        scope: [auth.scope.client, auth.scope.admin]
    });

    t.ok(authPromise, 'true expected');
    t.end();
});

tape.test('if all roles are not present with no rule then return false', function(t) {

    const authPromise = auth.isAuthorized(['admin'], {
        scope: [auth.scope.client, auth.scope.admin]
    });

    t.notOk(authPromise, 'true expected');
    t.end();
});

tape.test('if at least one role is present with Any rule then return true', function(t) {

    const authPromise = auth.isAuthorized(['admin'], {
        scope: [auth.scope.admin, auth.scope.client],
        rule: auth.rule.any
    });

    t.ok(authPromise, 'true expected');
    t.end();
});

tape.test('if no roles are present with Any rule then return false', function(t) {

    const authPromise = auth.isAuthorized([], {
        scope: [auth.scope.admin, auth.scope.client],
        rule: auth.rule.any
    });

    t.notOk(authPromise, 'false expected');
    t.end();
});

tape.test('if at least one role is present with None rule then return false', function(t) {

    const authPromise = auth.isAuthorized(['admin'], {
        scope: [auth.scope.admin, auth.scope.client],
        rule: auth.rule.none
    });

    t.notOk(authPromise, 'false expected');
    t.end();
});

tape.test('if no unallowed roles present with None rule then return true', function(t) {

    const authPromise = auth.isAuthorized(['admin'], {
        scope: [auth.scope.client],
        rule: auth.rule.none
    });

    t.ok(authPromise, 'true expected');
    t.end();
});

tape.test('if valid token and valid scope then return true', function(t) {

    const authPromise = auth.authenticate('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QHRlc3QuY29tIiwic2NvcGVzIjpbInRlc3RlciJdfQ.MjK579tyUaxtY9FXpTktC-vssI-rOS1RNsGl8KWX9mM', {
        scope: [auth.scope.admin],
        rule: auth.rule.none
    });

    t.ok(authPromise, 'true expected');
    t.end();
});

tape.test('if invalid token and valid scope then false', function(t) {

    const authPromise = auth.authenticate('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QHRlc3QuY29tIiwic2NvcGVzIjpbInRlc3RlciJdfQ.MjK579tyUaxtY9FXpTktC-vssI-rOS1RNsGl8KWX9mM' + 'foo', {
        scope: [auth.scope.admin],
        rule: auth.rule.none
    });

    authPromise.then(function(decoded) {
        t.fail('didn\'t throw error');
        t.end();
    }).catch(function(err) {
        t.ok(err, 'error is returned');
        t.equal('401', err.code);
        t.end();
    })
});

tape.test('if valid token and invalid scope then false', function(t) {

    const authPromise = auth.authenticate('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QHRlc3QuY29tIiwic2NvcGVzIjpbInRlc3RlciJdfQ.MjK579tyUaxtY9FXpTktC-vssI-rOS1RNsGl8KWX9mM', {
        scope: [auth.scope.tester]
    });

    authPromise.then(function(decoded) {
        t.fail('didn\'t throw error');
        t.end();
    }).catch(function(err) {
console.log(':asasas');
        t.ok(err, 'error is returned');
        t.equal('401', err.code);
        t.end();
    })
});
