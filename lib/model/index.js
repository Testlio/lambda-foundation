'use strict';

const Promise = require('promiscuous');
const vogels = require('vogels');
const _ = require('lodash');
const config = require('../configuration');
const Error = require('../error');

vogels.AWS.config.update({
    region: config.aws.region || 'us-east-1'
});

function configure(options) {
    if(options.dynamoDB) {
        vogels.dynamoDriver(options.dynamoDB);
    }
}

function Model(name, schema, options) {
    if(options) {
        configure(options);
    }
    this.table = vogels.define(name, schema);

    this.table.config({
        tableName: _.compact([config.aws.projectName, config.aws.stage, _.toLower(name)]).join('-')
    });
}

module.exports = Model;

Model.prototype.find = function(key, options) {
    const table = this.table;
    return new Promise(function(resolve, reject) {
        table.get(key, options, function(err, result) {
            if (err) return reject(Error.error(500, err.message));

            return resolve(result? result.attrs: null);
        });
    });
};

Model.prototype.findItems = function(keys, options) {
    const table = this.table;
    return new Promise(function(resolve, reject) {
        table.getItems(keys, options, function(err, results) {
            if (err) return reject(Error.error(500, err.message));
            const items = results.map(function(item) {
                return item.attrs;
            });
            return resolve(items.length > 0 ? items: null);
        });
    });
};
