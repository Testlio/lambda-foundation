'use strict';

const jwt = require('jsonwebtoken');
const _ = require('lodash');

let properties = {};

/**
* @param object extra - extra parameters to add to the event
*/
module.exports = function (extras){
    properties = extras || {};

    return {
        /**
         * Constructs an authorized event object
         *
         * @param {object|string} payload - payload for the generated jwt token.
         *                                If a string is passed, it is interpreted
         *                                as the subject of the payload \{sub: payload\}
         * @param string secret - secret to sign the jwt token with
         * @returns object - event with a valid jwt token as the 'authorized' property
         */
        authorized: function(payload, secret) {
            secret = secret || 'default_secret';

            payload = payload || {};
            payload = _.isString(payload) ? {sub: payload} : payload;

            return _.merge(
                { authorization: jwt.sign(payload, secret) },
                properties
            );
        },

        /**
         * Constructs an unauthorized event object
         *
         * @returns object - event with an invalid jwt token as the 'authorized' property
         */
        unauthorized: function() {
            return _.merge(
                { authorization: 'invalid_token' },
                 properties
             );
        }
    };
};
