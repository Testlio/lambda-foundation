'use strict';
const vogels = require('vogels');
const _ = require('lodash');
const config = require('../configuration');
const BaseModel = require('./baseModel');

if (config.dynamodb && config.dynamodb.endpoint) {
    console.log('Using configured DynamoDB endpoint', config.dynamodb.endpoint); // eslint-disable-line no-console
    const dynamodb = new vogels.AWS.DynamoDB({endpoint: config.dynamodb.endpoint});
    vogels.dynamoDriver(dynamodb);
}

vogels.AWS.config.update({
    region: config.dynamodb.region || config.aws.region || 'us-east-1'
});

module.exports = function(name, schema) {
    const VogelsModel = vogels.define(name, schema);
    VogelsModel.config({
        tableName: _.compact([config.project.name, config.aws.stage, _.kebabCase(name)]).join('-')
    });
    const Model = function() {};
    Model._parent = VogelsModel;
    _.extend(Model, VogelsModel);
    return _.extend(Model, BaseModel);
};
