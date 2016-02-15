'use strict';

const _ = require('lodash');

function forOwnDeep(object, callback, prefix) {
    prefix = prefix ? prefix + '.' : '';

    _.forOwn(object, function(value, key) {
        if (_.isString(value)) {
            callback(value, prefix + key);
        } else {
            forOwnDeep(value, callback, prefix);
        }
    });
}

module.exports = {
    forOwnDeep: forOwnDeep
};
