'use strict';

const joi = require('joi');
const sinon = require('sinon');
const vogels = require('vogels');
const tape = require('tape');
const Model = require('../lib/model');

const testItem1 = {key: 'aaa', property: 1};
const testItem2 = {key: 'bbb', property: 2};

const TestModel = Model('Test', {
    hashKey : 'key',
    schema : {
        key : joi.string(),
        property: joi.number()
    }
});

const modelObj = vogels.models['Test'];

const queryObj = modelObj.query();

const createStub = sinon.stub(modelObj, 'create', function(attributes) {
    const resolver = [].slice.call(arguments).pop();

    if (Array.isArray(attributes)) {
        resolver(null, [{attrs: testItem1}, {attrs: testItem2}]);
    } else {
        resolver(null, {attrs: testItem1});
    }
});
const updateStub = sinon.stub(modelObj, 'update', function() {
    const resolver = [].slice.call(arguments).pop();
    resolver(null, {attrs: testItem1});
});
let destroyStub = sinon.stub(modelObj, 'destroy', function() {
    const resolver = [].slice.call(arguments).pop();
    resolver(null, {attrs: testItem1});
});
const getStub = sinon.stub(modelObj, 'get', function() {
    const resolver = [].slice.call(arguments).pop();
    resolver(null, {attrs: testItem1});
});
const getItemsStub = sinon.stub(modelObj, 'getItems', function() {
    const resolver = [].slice.call(arguments).pop();
    resolver(null, [{attrs: testItem1}, {attrs: testItem2}]);
});

const execStub = sinon.stub(queryObj, 'exec', function() {
    const resolver = [].slice.call(arguments).pop();
    resolver(null, [{attrs: testItem1}]);
});

sinon.stub(modelObj, 'query', function() {
    return {exec: execStub};
});

sinon.stub(modelObj, 'scan', function() {
    return {exec: execStub};
});

tape.test('Should have tableName', function(t) {
    t.equal(TestModel.tableName(), 'test', 'Correct table name');
    t.end();
});

tape.test('Should find item', function(t) {
    TestModel.find('aaa').then(function(result) {
        t.same(result, testItem1, 'Found item by key');
        t.end();
    }).catch(function(err)  {
        t.fail(err);
        t.end();
    });
});

tape.test('Should find items', function(t) {
    TestModel.findItems(['aaa', 'bbb']).then(function(result) {
        t.same(result, [testItem1, testItem2], 'Found items by key');
        t.end();
    }).catch(function(err)  {
        t.fail(err);
        t.end();
    });
});

tape.test('Should create item', function(t) {
    TestModel.create(testItem1).then(function(result) {
        t.same(result, testItem1, 'Created item');
        t.end();
    }).catch(function(err)  {
        t.fail(err);
        t.end();
    });
});

tape.test('Should create items', function(t) {
    TestModel.create([testItem1, testItem2]).then(function(results) {
        t.same(results, [testItem1, testItem2], 'Created item');
        t.end();
    }).catch(function(err)  {
        t.fail(err);
        t.end();
    });
});

tape.test('Should update item', function(t) {
    TestModel.update(testItem1, {ReturnValues: 'ALL_NEW'}).then(function(result) {
        t.same(result, testItem1, 'Updated item');
        t.end();
    }).catch(function(err)  {
        t.fail(err);
        t.end();
    });
});

tape.test('Should delete item', function(t) {
    TestModel.destroy('aaa', {ReturnValues: 'ALL_OLD'}).then(function(result) {
        t.same(result, testItem1, 'Deleted item');
        t.end();
    }).catch(function(err)  {
        t.fail(err);
        t.end();
    });
});

tape.test('Should query item', function(t) {
    TestModel.query('aaa').exec().then(function(result) {
        t.same(result, [testItem1], 'Found item by query');
        t.end();
    }).catch(function(err)  {
        t.fail(err);
        t.end();
    });
});

tape.test('Should scan item', function(t) {
    TestModel.query('aaa').exec().then(function(result) {
        t.same(result, [testItem1], 'Found item by query');
        t.end();
    }).catch(function(err)  {
        t.fail(err);
        t.end();
    });
});

tape.test('Should fail with error', function(t) {
    destroyStub.restore();
    destroyStub = sinon.stub(modelObj, 'destroy', function() {
        const resolver = [].slice.call(arguments).pop();
        resolver(new Error('Something broke'), null);
    });
    TestModel.destroy('aaa').then(function() {
        t.fail('Should result in error');
        t.end();
    }).catch(function(err)  {
        t.same(err,
            {
                code: 500,
                extra: undefined, message: '500: Something broke', name: 'LambdaError', request: undefined
            },
            'Caught an error');
        t.end();
    });
});

tape.test('Should call vogels methods', function(t) {
    t.ok(createStub.called, 'Create called');
    t.ok(destroyStub.called, 'Destroy called');
    t.ok(execStub.calledTwice, 'Exec called twice');
    t.ok(updateStub.called, 'Update called');
    t.ok(getStub.called, 'Get called');
    t.ok(getItemsStub.called, 'GetItems called');
    t.end();
});
