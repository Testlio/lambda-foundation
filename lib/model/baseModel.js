'use strict';
const Promise = require('promiscuous');
const Error = require('../error');

const BaseModel = function() { };

module.exports = BaseModel;

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
    return attributes.length > 0 ? attributes : null;
}


BaseModel.find = function(key, options) {
    return vogelsThunk(this._parent.get)(key, options).then(singleResult);
};

BaseModel.findItems = function(keys, options) {
    return vogelsThunk(this._parent.getItems)(keys, options).then(multipleResults);
};

BaseModel.create = function(attributes, options) {
    return vogelsThunk(this._parent.create)(attributes, options).then(singleResult);
};

BaseModel.update = function(attributes, options) {
    return vogelsThunk(this._parent.update)(attributes, options).then(singleResult);
};

BaseModel.destroy = function(attributes, options) {
    return vogelsThunk(this._parent.destroy)(attributes, options).then(singleResult);
};

BaseModel.query = function(key) {
    const parentQuery = this._parent.query(key);
    const originalExec = parentQuery.exec;
    parentQuery.exec = function() {
        return vogelsThunk(originalExec.bind(parentQuery))().then(multipleResults);
    };
    return parentQuery;
};

BaseModel.scan = function() {
    const parentScan = this._parent.scan();
    const originalExec = parentScan.exec;
    parentScan.exec = function() {
        return vogelsThunk(originalExec.bind(parentScan))().then(multipleResults);
    };
    return parentScan;
};
