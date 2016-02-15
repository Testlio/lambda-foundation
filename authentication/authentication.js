'use strict';

const jwt = require('jsonwebtoken');
const Promise = require('promiscuous');
const Error = require('../error-reporting/error').error;

module.exports = {

    /**
     * Checks if token is validated and if client has necessary scopes
     *
     * @param string token - jwt token to be validated
     * @param object requirements - requirements for a request. Contains required
     *                              scopes and a rule for the scopes.
     *                              example:
     *
     *                              requirements = {
     *                                  rule: RULE.ALL,
     *                                  scope: [SCOPE.TESTER, SCOPE.QA]
     *                              }
     */
    authenticate: function(token, requirements) {
        return new Promise(function(resolve, reject) {
            const tokenPromise = module.exports.validateToken(token);

            tokenPromise.then(function(decoded) {
                if (isAuthorized(decoded.scope, requirements)) {
                    return Promise.resolve(decoded);
                }
                return Promise.reject(Error('401', 'Invalid token'));
            }).catch(function(err) {
                return reject(Error('401', 'Invalid token'));
            });
        });
    },

    /**
     * Checks if jwt token is valid
     *
     * @param string token - jwt token to be validated
     */
    validateToken: function(token) {
        return new Promise(function(resolve, reject) {
            try {
                if (token.startsWith('Bearer')) {
                    token = token.substring(6).trim();
                }

                // Read the secret from the env or fall back to default one
                const secret = process.env.AUTH_SECRET || 'default_secret';
                const decoded = jwt.verify(token, secret, {
                    algorithms: ["HS256"]
                });

                resolve(decoded);
            } catch(err) {
                return reject(Error('401', 'Invalid token'));
            }
        });
    },

    /**
     * Checks if client has the necessary scopes
     *
     * @param array clientScopes - scopes that the client has
     * @param object requirements - requirements for a request. Contains required
     *                              scopes and a rule for the scopes.
     *                              example:
     *
     *                              requirements = {
     *                                  rule: RULE.ALL,
     *                                  scope: [SCOPE.TESTER, SCOPE.QA]
     *                              }
     */
    isAuthorized: function(clientScopes, requirements) {
        const requestRule = requirements.rule ? requirements.rule : this.RULE.ALL;
        const requiredScopes = requirements ? [].concat(requirements.scope) : null;
        const presentScopes = clientScopes ? [].concat(clientScopes) : null;

        if (requiredScopes && requiredScopes.length > 0) {
            if (!presentScopes) {
                return false;
            }

            const filtered = requiredScopes.filter(function(item) {
                return presentScopes.indexOf(item) != -1;
            });

            if (requestRule === this.RULE.ANY && filtered.length === 0) {
                return false;
            }
            if (requestRule === this.RULE.ALL && filtered.length != requiredScopes.length) {
                return false;
            }
            if (requestRule === this.RULE.NONE && filtered.length > 0) {
                return false;
            }
        }

        return true;
    },

    SCOPE: {
        TESTER: 'tester',
        CLIENT: 'client',
        QA: 'qa_manager',
        ADMIN: 'admin'
    },

    RULE: {
        ANY: 'any',
        NONE: 'none',
        ALL: 'all'
    }
};
