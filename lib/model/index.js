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

function vogelsThunk(fn) {
    return function() {
        const args = [].slice.call(arguments);
        return new Promise(function(resolve, reject) {
            function resolver(err, result) {
                if (err) return reject(Error.error(500, err.message));
                resolve(result);
            }
            fn.apply(fn, args.concat(resolver));
        });
    };
}

function singleResult(result) {
    return result? result.attrs: null;
}

function multipleResults(result) {
    if(result.Items) {
        result = result.Items;
    }
    const attributes = result.map(function(item) {
        return item.attrs;
    });
    return attributes.length > 0 ? attributes[0] : null;
}


function BaseModel() { }

BaseModel.find = function(key, options) {
    return vogelsThunk(this._parent.get)(key, options).then(singleResult);
};

BaseModel.findItems = function(keys, options) {
    return vogelsThunk(this._parent.getItems)(keys, options).then(multipleResults);
};

BaseModel.create = function(attributes) {
    return vogelsThunk(this._parent.create)(attributes).then(singleResult);
};

BaseModel.update = function(attributes) {
    return vogelsThunk(this._parent.update)(attributes).then(singleResult);
};

BaseModel.query = function(key) {
    const parentQuery = this._parent.query(key);
    const originalExec = parentQuery.exec;
    parentQuery.exec = function() {
        return vogelsThunk(originalExec.bind(parentQuery))().then(multipleResults);
    };
    return parentQuery;
};

module.exports = function(name, schema, options) {
    if(options) {
        configure(options);
    }
    const VogelsModel = vogels.define(name, schema);
    VogelsModel.config({
        tableName: _.compact([config.aws.projectName, config.aws.stage, _.toLower(name)]).join('-')
    });
    const Model = function() {};
    Model._parent = VogelsModel;
    _.extend(Model, VogelsModel);
    return _.extend(Model, BaseModel);
};
