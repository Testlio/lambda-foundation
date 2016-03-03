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

const createSpy = sinon.stub(modelObj, 'create', function() {
    const resolver = [].slice.call(arguments).pop();
    resolver(null, {attrs: testItem1});
});
const updateSpy = sinon.stub(modelObj, 'update', function() {
    const resolver = [].slice.call(arguments).pop();
    resolver(null, {attrs: testItem1});
});
const destroySpy = sinon.stub(modelObj, 'destroy', function() {
    const resolver = [].slice.call(arguments).pop();
    resolver(null, {attrs: testItem1});
});
const getSpy = sinon.stub(modelObj, 'get', function() {
    const resolver = [].slice.call(arguments).pop();
    resolver(null, {attrs: testItem1});
});
const getItemsSpy = sinon.stub(modelObj, 'getItems', function() {
    const resolver = [].slice.call(arguments).pop();
    resolver(null, [{attrs: testItem1}, {attrs: testItem2}]);
});

const execSpy = sinon.stub(queryObj, 'exec', function() {
    const resolver = [].slice.call(arguments).pop();
    resolver(null, [{attrs: testItem1}]);
});

sinon.stub(modelObj, 'query', function() {
    return {exec: execSpy};
});

sinon.stub(modelObj, 'scan', function() {
    return {exec: execSpy};
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

tape.test('Should call vogels methods', function(t) {
    t.ok(createSpy.called, 'Create called');
    t.ok(destroySpy.called, 'Destroy called');
    t.ok(execSpy.calledTwice, 'Exec called twice');
    t.ok(updateSpy.called, 'Update called');
    t.ok(getSpy.called, 'Get called');
    t.ok(getItemsSpy.called, 'GetItems called');
    t.end();
});
