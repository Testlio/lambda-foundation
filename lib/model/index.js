'use strict';

const Promise = require('promiscuous');
const vogels = require('vogels');
const _ = require('lodash');
const extend = require('extend');
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
    const table = vogels.define(name, schema);

    table.config({
        tableName: _.compact([config.aws.projectName, config.aws.stage, _.toLower(name)]).join('-')
    });

    return extend(this, table);
}

module.exports = Model;

Model.prototype.find = function(key, options) {
    const get = this.get;
    return new Promise(function(resolve, reject) {
        get(key, options, function(err, result) {
            if (err) return reject(Error.error(500, err.message));

            return resolve(result? result.attrs: null);
        });
    });
};

Model.prototype.findItems = function(keys, options) {
    const getItems = this.getItems;
    return new Promise(function(resolve, reject) {
        getItems(keys, options, function(err, results) {
            if (err) return reject(Error.error(500, err.message));
            const items = results.map(function(item) {
                return item.attrs;
            });
            return resolve(items.length > 0 ? items: null);
        });
    });
};
