'use strict';

const tape = require('tape');
const sinon = require('sinon');
const Context = require('../lib/test/context');

let endStub;
let okStub;
let failStub;
let sameStub;

function stub(t) {
    endStub = sinon.stub(t, 'end');
    okStub = sinon.stub(t, 'ok');
    failStub = sinon.stub(t, 'fail');
    sameStub = sinon.stub(t, 'same');
}

function restore() {
    endStub.restore();
    okStub.restore();
    failStub.restore();
    sameStub.restore();
}

function assertFailure() {
    sinon.assert.notCalled(okStub);
    sinon.assert.notCalled(sameStub);
    sinon.assert.calledOnce(endStub);
    sinon.assert.calledOnce(failStub);
}

function assertSuccess(okCallCount) {
    okCallCount = okCallCount || 1;
    sinon.assert.callCount(okStub, okCallCount);
    sinon.assert.calledOnce(sameStub);
    sinon.assert.calledOnce(endStub);
    sinon.assert.notCalled(failStub);
}

tape.test('Should call expected test methods on context succeed expected and called', function(t) {
    stub(t);
    const mock = Context.assertSucceed(t, {result:"result"});
    mock.succeed({result:"result"});

    assertSuccess();
    restore();
    t.end();
});

tape.test('Should call expected test methods on context succeed expected but fail called', function(t) {
    stub(t);
    const mock = Context.assertSucceed(t, {result:"result"});
    mock.fail({result:"result"});

    assertFailure();
    restore();
    t.end();
});

tape.test('Should call expected test methods on context succeed expected but done called', function(t) {
    stub(t);
    const mock = Context.assertSucceed(t, {result:"result"});
    mock.done({result:"result"});

    assertFailure();
    restore();
    t.end();
});

tape.test('Should call expected test methods on context fail expected and called', function(t) {
    stub(t);
    const mock = Context.assertFail(t, {result:"result"});
    mock.fail({result:"result"});

    assertSuccess();
    restore();
    t.end();
});

tape.test('Should call expected test methods on context fail expected but succeed called', function(t) {
    stub(t);
    const mock = Context.assertFail(t, {result:"result"});
    mock.succeed({result:"result"});

    assertFailure();
    restore();
    t.end();
});

tape.test('Should call expected test methods on context fail expected but done called', function(t) {
    stub(t);
    const mock = Context.assertFail(t, {result:"result"});
    mock.done(null, {result:"result"});

    assertFailure();
    restore();
    t.end();
});

tape.test('Should call callback on succeed', function(t) {
    stub(t);
    const mock = Context.assertSucceed(t, {result:"result"}, function(obj) {
        t.ok(obj, 'Callback called');
    });
    mock.succeed({result:"result"});

    assertSuccess(2);
    restore();
    t.end();
});

tape.test('Should call callback on fail', function(t) {
    stub(t);
    const mock = Context.assertFail(t, {result:"result"}, function(obj) {
        t.ok(obj, 'Callback called');
    });
    mock.fail(null, {result:"result"});

    assertSuccess(2);
    restore();
    t.end();
});
