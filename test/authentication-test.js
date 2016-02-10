"use strict";

const tape = require('tape');
var auth = require('../authentication/authentication');

tape.test('If no token return 401', function(t) {

    let authPromise = auth.validateToken();

    authPromise.then(function(decoded) {
        t.fail('didn\'t throw error');
        t.end();
    }).catch(function(err) {
        t.ok(err, 'error is returned');
        t.equal('401', err.code);
        t.end();
    })
});

tape.test('If invalid token return 401', function(t) {

    let authPromise = auth.validateToken('foo');

    authPromise.then(function(decoded) {
        t.fail('didn\'t throw error');
        t.end();
    }).catch(function(err) {
        t.ok(err, 'error is returned');
        t.equal('401', err.code);
        t.end();
    })
});

tape.test('If valid token return decoded token', function(t) {

    let authPromise = auth.validateToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJrYWFyZWxwdXJkZUBnbWFpbC5jb20ifQ.zagQW2DUQ418Kzy2EwtmP6UyIl36SMziHIr3aQ3hS0U');

    authPromise.then(function(decoded) {
        t.equal('kaarelpurde@gmail.com', decoded.sub);
        t.end();
    }).catch(function(err) {
        t.fail('should not throw error: ' + err);
        t.end();
    })
});

tape.test('if all roles not present return false', function(t) {

    let result = auth.isAuthorized([], {
        scope: [auth.Scope.Client, auth.Scope.Admin]
    });

    t.notOk(result, 'false expected');
    t.end();
});

tape.test('if all roles are present then return true', function(t) {

    let authPromise = auth.isAuthorized(['client', 'admin'], {
        scope: [auth.Scope.Client, auth.Scope.Admin]
    });

    t.ok(authPromise, 'true expected');
    t.end();
});

tape.test('if all roles are present then return true', function(t) {

    let authPromise = auth.isAuthorized(['admin'], {
        scope: [auth.Scope.Client, auth.Scope.Admin]
    });

    t.notOk(authPromise, 'true expected');
    t.end();
});

tape.test('if at least one role is present with Any rule then return true', function(t) {

    let authPromise = auth.isAuthorized(['admin', 'client'], {
        scope: [auth.Scope.Admin],
        rule: auth.Rule.Any
    });

    t.ok(authPromise, 'true expected');
    t.end();
});

tape.test('if at least one role is present with None rule then return false', function(t) {

    let authPromise = auth.isAuthorized(['admin', 'client'], {
        scope: [auth.Scope.Admin],
        rule: auth.Rule.None
    });

    t.notOk(authPromise, 'false expected');
    t.end();
});
