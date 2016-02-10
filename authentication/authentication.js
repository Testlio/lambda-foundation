"use strict";

const jwt = require('jsonwebtoken');
const Promise = require('promiscuous');
const Error = require('../error-reporting/error').error;

module.exports = {

    validateToken: function(token) {
        return new Promise(function(resolve, reject) {
            if (!token) {
                return reject(Error('401', 'Invalid token'));
            }

            if (token.startsWith('Bearer')) {
                token = token.substring(6).trim();
            }

            try {
                const decoded = jwt.verify(token, 'secret', {
                    algorithms: ["HS256"]
                });
                resolve(decoded);
            } catch(err) {
                return reject(Error('401', 'Invalid token'));
            }
        });
    },

    isAuthorized: function(scopes, requiredScopes) {
        let rule = requiredScopes.rule ? requiredScopes.rule : this.Rule.All;

        let required = requiredScopes ? requiredScopes.scope : null;
        let present = scopes ? scopes : null;

        if (required && required.length > 0) {
            if (!present) {
                return false;
            }

            required = [].concat(required);
            present = [].concat(present);

            const filtered = required.filter(function(item) {
                return present.indexOf(item) != -1;
            });

            if (rule === this.Rule.All && filtered.length != required.length) {
                return false;
            }
            if (rule === this.Rule.None && filtered.length > 0) {
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
    },

    Rule: {
        Any: 'any',
        None: 'none',
        All: 'all'
    }
};
