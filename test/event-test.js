
const tape = require('tape');
const Event = require('../lib/test/event');
const jwt = require('jsonwebtoken');
const auth = require('../lib/authentication');

tape.test('Should return authorized event with default secret', function(t) {

    const event = Event().authorized();

    t.ok(event.authorization, 'Event has authorization defined');

    try {
        auth.isValidToken(event.authorization);
    } catch(err) {
        t.fail('Unable to verify token');
    }
    t.same(event, {authorization: event.authorization}, 'Authorized event returned');
    t.end();
});

tape.test('Should return authorized event with custom secret', function(t) {

    const testSecret = 'some-secret';
    
    const event = Event().authorized(null, testSecret);

    t.ok(event.authorization, 'Event has authorization defined');

    try {
        auth.config({ secret: testSecret });
        auth.isValidToken(event.authorization);
    } catch(err) {
        t.fail('Unable to verify token');
    }
    t.same(event, {authorization: event.authorization}, 'Authorized event returned');
    auth.config({ secret: undefined }); // teardown because following tests use `default_secret`
    t.end();
});


tape.test('Should return authorized event with email payload', function(t) {

    const event = Event().authorized('tester@testlio.com');

    t.ok(event.authorization, 'Event has authorization defined');

    try {
        const decoded = auth.isValidToken(event.authorization);
        t.same(decoded, {iat: decoded.iat, sub: 'tester@testlio.com'});
    } catch(err) {
        t.fail('Unable to verify token');
    }
    t.same(event, {authorization: event.authorization}, 'Authorized event returned');
    t.end();
});

tape.test('Should return authorized event', function(t) {

    const event = Event({property: 'property'})
        .authorized({sub: 'tester@testlio.com', scopes: ['admin']});

    t.ok(event.authorization, 'Event has authorization defined');

    try {
        const decoded = auth.isValidToken(event.authorization);
        t.same(decoded, {iat: decoded.iat, sub: 'tester@testlio.com', scopes: ['admin']});
    } catch(err) {
        t.fail('Unable to verify token');
    }
    t.same(event, {authorization: event.authorization, property: 'property'}, 'Authorized event returned');
    t.end();
});

tape.test('Should return authorized event with extra properties', function(t) {

    const event = Event({property: 'property'}).authorized();

    t.ok(event.authorization, 'Event has authorization defined');

    try {
        const decoded = auth.isValidToken(event.authorization);
        t.same(decoded, {iat: decoded.iat});
    } catch(err) {
        t.fail('Unable to verify token');
    }
    t.same(event, {authorization: event.authorization, property: 'property'}, 'Authorized event returned');
    t.end();
});


tape.test('Should return unauthorized event with extra properties', function(t) {

    const event = Event({property: 'property'}).unauthorized();

    t.ok(event.authorization, 'Event has authorization defined');

    try {
        jwt.verify(event.authorization, 'default_secret');
    } catch(err) {
        t.ok(err, 'Token verification failed as expected');
    }

    t.same(event, {authorization: event.authorization, property: 'property'}, 'Unauthorized event returned');
    t.end();
});
