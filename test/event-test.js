
const tape = require('tape');
const Event = require('../lib/test/event');
const jwt = require('jsonwebtoken');

tape.test('Should return authorized event', function(t) {

    const event = Event.authorizedEvent();

    t.ok(event.authorization, 'Event has authorization defined');

    try {
        jwt.verify(event.authorization, 'default_secret');
    } catch(err) {
        t.fail('Unable to verify token');
    }
    t.same(event, {authorization: event.authorization}, 'Authorized event returned');
    t.end();
});

tape.test('Should return authorized event with email payload', function(t) {

    const event = Event.authorizedEvent('tester@testlio.com');

    t.ok(event.authorization, 'Event has authorization defined');

    try {
        const decoded = jwt.verify(event.authorization, 'default_secret');
        t.same(decoded, {iat: decoded.iat, sub: 'tester@testlio.com'});
    } catch(err) {
        t.fail('Unable to verify token');
    }
    t.same(event, {authorization: event.authorization}, 'Authorized event returned');
    t.end();
});

tape.test('Should return authorized event', function(t) {

    const event = Event.authorizedEvent('tester@testlio.com', ['admin'], {property: 'property'});

    t.ok(event.authorization, 'Event has authorization defined');

    try {
        const decoded = jwt.verify(event.authorization, 'default_secret');
        t.same(decoded, {iat: decoded.iat, sub: 'tester@testlio.com', scopes: ['admin']});
    } catch(err) {
        t.fail('Unable to verify token');
    }
    t.same(event, {authorization: event.authorization, property: 'property'}, 'Authorized event returned');
    t.end();
});

tape.test('Should return unauthorized event', function(t) {

    const event = Event.unauthorizedEvent({property: 'property'});

    t.ok(event.authorization, 'Event has authorization defined');

    try {
        jwt.verify(event.authorization, 'default_secret');
    } catch(err) {
        t.ok(err, 'Token verification failed as expected');
    }

    t.same(event, {authorization: event.authorization, property: 'property'}, 'Unauthorized event returned');
    t.end();
});