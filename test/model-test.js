const joi = require('joi');
const tape = require('tape');
const Model = require('../lib/model');

/*eslint-disable no-console */
tape.test('Should create model', function(t) {
    const testModel = new Model('Test', {
        hashKey : 'guid',
        schema : {
            guid : joi.string().guid(),
            property: joi.number()
        }
    }, {region: 'us-east-1'});

    t.equal(testModel.tableName(), 'test', 'Correct table name');
    t.end();
});
