"use strict";

const jwt = require('jsonwebtoken');
const Promise = require('promiscuous');
const Error = require('../error-reporting/error').error;

module.exports = {

    authenticate: function(token, requiredScopes) {

        return new Promise(function(resolve, reject) {

            if (!token || token.length ==  0) {
                return reject(Error('401', 'Invalid token'));
            }

            if (token.startsWith('Bearer')) {
                token = token.substring(6).trim();
            }

            let decoded;
            try {
                decoded = jwt.verify(token, 'secret', {
                    algorithms: ["HS256"]
                });
            } catch(err) {
                return reject(Error('401', 'Invalid token'));
            }

            resolve(decoded);
        });
    },

    hasScope: function(token, requiredScopes) {
        let required = requiredScopes ? requiredScopes.scope : null;
        let present = token ? token.scope : null;

        if (required && required.length > 0) {
            if (!present) {
                return false;
            }

            required = [].concat(required);
            present = [].concat(present);

            const filtered = required.filter(function(item) {
                return present.indexOf(item) != -1;
            });

            if (requiredScopes.requireAll && filtered.length != required.length) {
                return false;
            } else if (filtered.length == 0) {
                return false;
            }
        }

        return true;
    },

    Scope: {
        Tester: 'tester',
        Client: 'client',
        QA: 'qa_manager',
        Admin: 'admin'
    }
};

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(prefix) {
        return this.indexOf(prefix, 0) === 0;
    };
}
