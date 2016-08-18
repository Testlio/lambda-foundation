const tape = require('tape');
const FoundationError = require('../lib/error');
const Context = require('../lib/test/context');

tape.test('Should succeed with expected result provided', function(t) {
    const mock = Context.assertSucceed(t, {result:"result"});
    t.plan(2);
    mock.succeed({result:"result"});
});

tape.test('Should succeed with expected result and callback provided', function(t) {
    t.plan(3);
    const mock = Context.assertSucceed(t, {result:"result"}, function(obj) {
        t.same(obj, {result:"result"}, 'callback called');
    });
    mock.succeed({result:"result"});
});

tape.test('Should succeed with callback provided', function(t) {
    t.plan(2);
    const mock = Context.assertSucceed(t, function(obj) {
        t.same(obj, {result:"result"}, 'callback called');
    });
    mock.succeed({result:"result"});
});

tape.test('Should fail with expected error provided', function(t) {
    const mock = Context.assertFail(t, new FoundationError('999', 'Expected error'));
    t.plan(2);
    mock.fail(new FoundationError('999', 'Expected error'));
});

tape.test('Should fail with expected error and callback provided', function(t) {
    const mock = Context.assertFail(t, new FoundationError('999', 'Expected error'), function(error) {
        t.same(error, new FoundationError('999', 'Expected error'), 'Callback called');
    });
    t.plan(3);
    mock.fail(new FoundationError('999', 'Expected error'));
});

tape.test('Should fail with expected error and callback provided', function(t) {
    const mock = Context.assertFail(t, function(error) {
        t.same(error, new FoundationError('999', 'Expected error'), 'Callback called');
    });
    t.plan(2);
    mock.fail(new FoundationError('999', 'Expected error'));
});

tape.test('Should succeed with done called', function(t) {
    const mock = Context.assertFail(t, new FoundationError('999', 'Expected error'));
    t.plan(2);
    mock.done(new FoundationError('999', 'Expected error'));
});

tape.test('Should succeed with done called', function(t) {
    const mock = Context.assertSucceed(t, {result:"result"});
    t.plan(2);
    mock.done(null, {result:"result"});
});

tape.test('Should assert that two identical vanilla errors are equal', function(t) {
    const mock = Context.assertFail(t, new Error('Expected error'));
    mock.fail(new Error('Expected error'));
});
