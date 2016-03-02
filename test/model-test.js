const joi = require('joi');
const tape = require('tape');
const Model = require('../lib/model');

/*eslint-disable no-console */
tape.test('should have tableName', function(t) {
    const TestModel = Model('Test', {
        hashKey : 'guid',
        schema : {
            guid : joi.string().guid(),
            property: joi.number()
        }
    });
    t.equal(TestModel.tableName(), 'test', 'Correct table name');
    t.end();
});

tape.test('should create model', function(t) {
    const TestModel = Model('Test', {
        hashKey : 'guid',
        schema : {
            guid : joi.string().guid(),
            property: joi.number()
        }
    });

    TestModel.find('guid').then(function(result) {
        console.log('find', result);
    }).catch(function(err)  {
        console.log('find', err);
    });

    TestModel.findItems(['guid']).then(function(result) {
        console.log('findItems', result);
    }).catch(function(err)  {
        console.log('findItems', err);
    });

    TestModel.query('guid').loadAll().limit(1).exec().then(function(result) {
        console.log('query', result);
    }).catch(function(err)  {
        console.log('query', err);
    });

    TestModel.create({guid: '7eacbb91-ef33-4d5a-a10c-2e9747adc2fa', property: 300}).then(function(result) {
        console.log('create', result);
    }).catch(function(err)  {
        console.log('create', err);
    });

    TestModel.update({guid: '7eacbb91-ef33-4d5a-a10c-2e9747adc2fa', property: 600}).then(function(result) {
        console.log('update', result);
    }).catch(function(err)  {
        console.log('update', err);
    });

    t.end();
});
