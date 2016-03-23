'use strict';

const jwt = require('jsonwebtoken');
const _ = require('lodash');

let jwtSecret = 'default_secret';

module.exports = {

    authorized: function(sub, scopes, properties) {
        //remove empty values
        const payload = _.pickBy({sub: sub, scopes:scopes});
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
