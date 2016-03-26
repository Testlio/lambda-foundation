'use strict';

const jwt = require('jsonwebtoken');
const _ = require('lodash');

let jwtSecret = 'default_secret';

module.exports = {

    authorized: function(payload, properties) {
        console.log(payload, properties);
        //remove empty values
        payload = payload || {};
        payload = _.isString(payload) ? {sub: payload} : payload;
        return _.merge(
            { authorization: jwt.sign(payload, jwtSecret) },
            properties
        );
    },

    unauthorized: function(properties) {
        return _.merge(
            { authorization: 'invalid_token' },
             properties
         );
    },

    secret: function(secret) {
        jwtSecret = secret;
        return this;
    },

    reset() {
        jwtSecret = 'default_secret';
        return this;
    }
};
