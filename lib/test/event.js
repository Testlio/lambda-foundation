'use strict';

const jwt = require('jsonwebtoken');
const _ = require('lodash');

let properties = {};

module.exports = function (extras){
    properties = extras || {};

    return {
        authorized: function(payload, secret) {
            secret = secret || 'default_secret';

            payload = payload || {};
            payload = _.isString(payload) ? {sub: payload} : payload;
            
            return _.merge(
                { authorization: jwt.sign(payload, secret) },
                properties
            );
        },

        unauthorized: function() {
            return _.merge(
                { authorization: 'invalid_token' },
                 properties
             );
        }
    };
};
