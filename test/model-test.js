const joi = require('joi');
const tape = require('tape');
const Model = require('../lib/model');

/*eslint-disable no-console */
tape.test('Should create model', function(t) {
    const TestModel = Model('Test', {
        hashKey : 'guid',
        schema : {
            guid : joi.string().guid(),
            property: joi.number()
        }
    });
    const testModel = new TestModel();

console.log(testModel.get);
    t.equal(TestModel.tableName(), 'test', 'Correct table name');

    testModel.find('guid').then(function(result) {
        console.log('find', result);
    }).catch(function(err)  {
        console.log('find', err);
    });

    testModel.findItems(['guid']).then(function(result) {
        console.log('findItems', result);
    }).catch(function(err)  {
        console.log('findItems', err);
    });

    testModel._query('guid').loadAll().limit(1).exec().then(function(result) {
        console.log('query', result);
    }).catch(function(err)  {
        console.log('query', err);
    });

    testModel.create({guid: '7eacbb91-ef33-4d5a-a10c-2e9747adc2fa', property: 300}).then(function(result) {
        console.log('create', result);
    }).catch(function(err)  {
        console.log('create', err);
    });

    testModel._update({guid: '7eacbb91-ef33-4d5a-a10c-2e9747adc2fa', property: 600}).then(function(result) {
        console.log('update', result);
    }).catch(function(err)  {
        console.log('update', err);
    });

    t.end();
});
