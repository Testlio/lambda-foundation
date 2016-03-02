const joi = require('joi');
const test = require('./dynamo-test');
const Model = require('../lib/model');

const testItem1 = {key: 'aaa', property: 1};
const testItem2 = {key: 'bbb', property: 2};
const testItem3 = {key: 'ccc', property: 3};

const testItems = [testItem1, testItem2, testItem3];

const TestModel = Model('Test', {
    hashKey : 'key',
    schema : {
        key : joi.string(),
        property: joi.number()
    }
});

const options = {
    testData: {
    },
    models: [TestModel]
};

options.testData[TestModel.tableName()] = testItems;

/*eslint-disable no-console */
test.test('Device model test', options, function(tape) {

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

    tape.test('Should query item', function(t) {
        TestModel.query('aaa').loadAll().limit(1).exec().then(function(result) {
            t.same(result, [testItem1], 'Found item by query');
            t.end();
        }).catch(function(err)  {
            t.fail(err);
            t.end();
        });
    });

    tape.test('Should create item', function(t) {
        const testItem4 = {key: 'ddd', property: 4};
        TestModel.create(testItem4).then(function(result) {
            t.same(result, testItem4, 'Created item');
            t.end();
        }).catch(function(err)  {
            t.fail(err);
            t.end();
        });
    });

    tape.test('Should update item', function(t) {
        const testItemUpdate3 = {key: testItem3.key, property: 5};
        TestModel.update(testItemUpdate3, {ReturnValues: 'ALL_NEW'}).then(function(result) {
            t.same(result, testItemUpdate3, 'Updated item');
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
});
