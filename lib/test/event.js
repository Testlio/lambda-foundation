const jwt = require('jsonwebtoken');
const _ = require('lodash');

module.exports = {

    authorizedEvent: function(sub, scopes, properties) {
        //remove empty values
        const payload = _.pickBy({sub: sub, scopes:scopes});
        return _.merge(
            { authorization: jwt.sign(payload, 'default_secret') },
            properties
        );
    },

    unauthorizedEvent: function(properties) {
        return _.merge(
            { authorization: 'invalid_token' },
             properties
         );
    }
};
