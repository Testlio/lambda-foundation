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

/**
 *  Create a new model, providing it a name and a Vogels schema
 *
 *  @param name - Name for the model, this is converted to kebab-case and used
 *                to create the final table name on AWS, which follows the format
 *                  <config.project.name>-<config.aws.stage>-<model-name>
 *  @param schema - Vogels schema for the model, used for validation before
 *                  submitting data to AWS
 *
 *  @returns Wrapped Vogels' model, which is promisified and has a
 *           few convenience APIs. For more info, look at baseModel.js
 */
module.exports = function(name, schema) {
    const VogelsModel = vogels.define(name, schema);
    VogelsModel.config({
        tableName: _.compact([config.project.name, config.aws.stage, _.kebabCase(name)]).join('-')
    });
    const Model = function() {};
    Model._parent = VogelsModel;
    _.extend(Model, VogelsModel);
    return _.extend(Model, BaseModel, {types: vogels.types});
};
