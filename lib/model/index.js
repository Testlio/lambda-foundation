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

Model.prototype.find = function(key, options) {
    return vogelsThunk(this.get)(key, options).then(function(result) {
        return result? result.attrs: null;
    });
};

Model.prototype.findItems = function(keys, options) {
    return vogelsThunk(this.getItems)(keys, options).then(function(results) {
        const items = results.map(function(item) {
            return item.attrs;
        });
        return items.length > 0 ? items: null;
    });
};

        });
    });
};
