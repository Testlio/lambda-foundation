'use strict';

const Promise = require('promiscuous');
const vogels = require('vogels');
const _ = require('lodash');
const extend = require('extend');
const config = require('../configuration');
const Error = require('../error');
const util = require('util');

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

function multipleResultsResult(results) {
    const attributes = results.Items.map(function(item) {
        return item.attrs;
    });

    return attributes.length > 0 ? attributes[0] : null;
}


function Model() {
}


module.exports = function(name, schema, options) {
    if(options) {
        configure(options);
    }
    const VogelsModel = vogels.define(name, schema);
    VogelsModel.config({
        tableName: _.compact([config.aws.projectName, config.aws.stage, _.toLower(name)]).join('-')
    });
    const NewModel = util.inherits(Model, VogelsModel);
    return NewModel;
};

Model.prototype.find = function(key, options) {
    console.log(this._parent);
    return vogelsThunk(this._parent.get)(key, options).then(function(result) {
        return singleResult(result);
    });
};

Model.prototype.findItems = function(keys, options) {
    return vogelsThunk(this.getItems)(keys, options).then(function(results) {
        return multipleResultsResult(results);
    });
};

Model.prototype.create = function(attributes) {
    console.log(this.Parent);
    return vogelsThunk(this.Parent.prototype.create)(attributes).then(function(result) {
        return singleResult(result);
    });
};

Model.prototype._query = function(key) {
    const q = this.query(key);
    const old = q.exec;
    q.exec = function() {
        return vogelsThunk(old.bind(q))().then(function(results) {
            return multipleResultsResult(results);
        });
    };
    return q;
};

// Model.prototype._query = function(key, index, limit) {
//     let _query = this.query(key);
//
//     if(index) {
//         _query = _query.usingIndex(index);
//     }
//
//     if(limit) {
//         _query = _query.limit(limit);
//     }
//
//     return vogelsThunk(_query.exec.bind(_query))().then(function(result) {
//         const attributes = result.Items.map(function(item) {
//             return item.attrs;
//         });
//
//         return attributes.length > 0 ? attributes[0] : null;
//     });
// };

Model.prototype._update = function(attributes) {
    return vogelsThunk(this.update)(attributes).then(function(result) {
        return singleResult(result);
    });
};
