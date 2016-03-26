'use strict';

const jwt = require('jsonwebtoken');
const _ = require('lodash');

let jwtSecret = 'default_secret';
let properties = {};

module.exports = {

    authorized: function(payload) {
        payload = payload || {};
        payload = _.isString(payload) ? {sub: payload} : payload;
        return _.merge(
            { authorization: jwt.sign(payload, jwtSecret) },
            properties
        );
    },

    unauthorized: function(extras) {
        return _.merge(
            { authorization: 'invalid_token' },
             extras,
             properties
         );
    },

    properties: function(extras) {
        properties = extras;
        return this;
    },

    secret: function(secret) {
        jwtSecret = secret;
        return this;
    },

    reset() {
        jwtSecret = 'default_secret';
        properties = {};
        return this;
    }
};
