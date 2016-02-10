"use strict";

const tape = require('tape');
var auth = require('../authentication/authentication');

tape.test('If no token return 401', function(t) {

    let authPromise = auth.authenticate();

    authPromise.then({
        t.fail('didn\'t throw error');
        t.end();
    }).catch(function(err) {
        t.ok(err, 'error is returned');
        t.equal('401', err.code);
        t.end();
    })
});

tape.test('If invalid token return 401', function(t) {

    let authPromise = auth.authenticate('foo');

    authPromise.then({
        t.fail('didn\'t throw error');
        t.end();
    }).catch(function(err) {
        t.ok(err, 'error is returned');
        t.equal('401', err.code);
        t.end();
    })
});

tape.test('If valid token return decoded token', function(t) {

    let authPromise = auth.authenticate('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJrYWFyZWxwdXJkZUBnbWFpbC5jb20ifQ.zagQW2DUQ418Kzy2EwtmP6UyIl36SMziHIr3aQ3hS0U');

    authPromise.then(function(decoded) {
        t.equal('kaarelpurde@gmail.com', decoded.sub);
        t.end();
    }).catch(function(err) {
        t.fail('should not throw error: ' + err);
        t.end();
    })
});
