'use strict';
const vogels = require('vogels');
const _ = require('lodash');
const config = require('../configuration');
const BaseModel = require('./baseModel');

if (config.dynamodb && config.dynamodb.endpoint) {
    const region = config.dynamodb.region || config.aws.region;
    console.log('Using configured DynamoDB endpoint', config.dynamodb.endpoint, region); // eslint-disable-line no-console
    const dynamodb = new vogels.AWS.DynamoDB({endpoint: config.dynamodb.endpoint, region: region});
    vogels.dynamoDriver(dynamodb);
}

vogels.AWS.config.update({
    region: config.aws.region || 'us-east-1'
});

module.exports = function(name, schema) {
    const VogelsModel = vogels.define(name, schema);
    VogelsModel.config({
        tableName: _.compact([config.project.name, config.aws.stage, _.kebabCase(name)]).join('-')
    });
    const Model = function() {};
    Model._parent = VogelsModel;
    _.extend(Model, VogelsModel);
    return _.extend(Model, BaseModel, {hashKey: schema.hashKey});
};
