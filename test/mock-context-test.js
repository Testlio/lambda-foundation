const tape = require('tape');
const Error = require('../lib/error');
const Context = require('../lib/test/mock-context');

//TODO add tape spies to assure correct methods get called

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

tape.test('Should fail if fail or done called', function(t) {
    t.plan(2);
    const mock = Context.assertSucceed(t, {result: "result"});
    mock.fail = function(err) {
        t.ok(err, 'Fail called');
    };
    mock.done = function(obj) {
        t.ok(obj, 'Done called');
    };
    mock.fail(new Error('999', 'Unexpected error'));
    mock.done({result: "unexpected result"});
});


tape.test('Should fail with expected error provided', function(t) {
    const mock = Context.assertFail(t, new Error('999', 'Expected error'));
    t.plan(2);
    mock.fail(new Error('999', 'Expected error'));
});

tape.test('Should fail with expected error and callback provided', function(t) {
    const mock = Context.assertFail(t, new Error('999', 'Expected error'), function(error) {
        t.same(error, new Error('999', 'Expected error'), 'Callback called');
    });
    t.plan(3);
    mock.fail(new Error('999', 'Expected error'));
});

tape.test('Should fail with expected error and callback provided', function(t) {
    const mock = Context.assertFail(t, function(error) {
        t.same(error, new Error('999', 'Expected error'), 'Callback called');
    });
    t.plan(2);
    mock.fail(new Error('999', 'Expected error'));
});

tape.test('Should fail if succeed or done called', function(t) {
    t.plan(2);
    const mock = Context.assertFail(t, new Error('999', 'Expected error'));
    mock.succeed = function(obj) {
        t.ok(obj, 'Succeed called');
    };
    mock.done = function(obj) {
        t.ok(obj, 'Done called');
    };
    mock.succeed({result: "unexpected result"});
    mock.done({result: "unexpected result"});
});

tape.test('Should call done with expected result provided', function(t) {
    const mock = Context.assertDone(t, {result:"result"});
    t.plan(2);
    mock.done({result:"result"});
});

tape.test('Should call done with expected result and callback provided', function(t) {
    t.plan(3);
    const mock = Context.assertDone(t, {result:"result"}, function(obj) {
        t.same(obj, {result:"result"}, 'callback called');
    });
    mock.done({result:"result"});
});

tape.test('Should call done with callback provided', function(t) {
    t.plan(2);
    const mock = Context.assertDone(t, function(obj) {
        t.same(obj, {result:"result"}, 'callback called');
    });
    mock.done({result:"result"});
});

tape.test('Should fail if fail or succeed called', function(t) {
    t.plan(2);
    const mock = Context.assertDone(t, {result: "result"});
    mock.fail = function(err) {
        t.ok(err, 'Fail called');
    };
    mock.done = function(obj) {
        t.ok(obj, 'Done called');
    };
    mock.fail(new Error('999', 'Expected error'));
    mock.done({result: "unexpected result"});
});
