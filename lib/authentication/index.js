'use strict';

const jwt = require('jsonwebtoken');
const Promise = require('promiscuous');
const _ = require('lodash');
const Error = require('../error').error;

module.exports = {
    //
    //  Constants
    //

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
    },

    /**
     * Checks if jwt token is valid
     *
     * @param string token - jwt token to be validated
     * @returns decoded token
     * @throws if token is invalid
     */
    isValidToken: function(token) {
        if (!token) {
            throw new Error('401', 'Invalid token');
        }

        if (_.startsWith(token, 'Bearer')) {
            token = token.substring(6).trim();
        }

        // Read the secret from the env or fall back to default one
        try {
            const secret = process.env.AUTH_SECRET || 'default_secret';
            const decoded = jwt.verify(token, secret, {
                algorithms: ["HS256"]
            });

            return decoded;
        } catch (err) {
            throw new Error('401', 'Invalid Token');
        }
    },

    /**
     * Checks if client token has the necessary scopes
     *
     * @param object token - client token
     * @param object requirements - requirements to fulfill. Contains required
     *                              scopes and a rule for the scopes.
     *                              example:
     *
     *                              requirements = {
     *                                  rule: RULE.ALL,
     *                                  scope: [SCOPE.TESTER, SCOPE.QA]
     *                              }
     */
    isAuthorized: function(token, requirements) {
        const scopes = token.scope;
        const requestRule = requirements.rule ? requirements.rule : this.RULE.ALL;
        const requiredScopes = requirements ? [].concat(requirements.scope) : null;
        const presentScopes = scopes ? [].concat(scopes) : null;

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

    /**
     * Checks if token is validated and if client has necessary scopes
     *
     * @param string token - jwt token to be validated
     * @param object requirements - optional requirements to fulfill. Contains required
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
            try {
                const decoded = module.exports.isValidToken(token);

                if (!requirements || module.exports.isAuthorized(decoded, requirements)) {
                    resolve(decoded);
                } else {
                    // Lacking scopes is not a sign of completely invalid token
                    reject(Error('403', 'Forbidden'));
                }
            } catch (err) {
                reject(err);
            }
        });
    }
};
