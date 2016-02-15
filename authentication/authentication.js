const jwt = require('jsonwebtoken');
const Promise = require('promiscuous');
const Error = require('../error-reporting/error').error;
const config = require('../configuration/config');

module.exports = {

    /**
     * checks if token is validated and if client has necessary scopes
     *
     * @param string token - jwt token to be validated
     * @param object requirements - requirements for a request. Contains required
     *                              scopes and a rule for the scopes.
     *                              example:
     *
     *                              requirements = {
     *                                  rule: 'all',
     *                                  scope: ['tester', 'qa_manager']
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
     * checks if jwt token is valid
     *
     * @param string token - jwt token to be validated
     */
    validateToken: function(token) {
        return new Promise(function(resolve, reject) {
            try {
                if (token.startsWith('Bearer')) {
                    token = token.substring(6).trim();
                }

                const decoded = jwt.verify(token, config.auth.secret, {
                    algorithms: ["HS256"]
                });
                resolve(decoded);
            } catch(err) {
                return reject(Error('401', 'Invalid token'));
            }
        });
    },

    /**
     * checks if client has the necessary scopes
     *
     * @param array clientScopes - scopes that the client is allowed into
     * @param object requirements - requirements for a request. Contains required
     *                              scopes and a rule for the scopes.
     *                              example:
     *
     *                              requirements = {
     *                                  rule: 'all',
     *                                  scope: ['tester', 'qa_manager']
     *                              }
     */
    isAuthorized: function(clientScopes, requirements) {
        const requestRule = requirements.rule ? requirements.rule : this.rule.all;
        const requiredScopes = requirements ? [].concat(requirements.scope) : null;
        const presentScopes = clientScopes ? [].concat(clientScopes) : null;

        if (requiredScopes && requiredScopes.length > 0) {
            if (!presentScopes) {
                return false;
            }

            const filtered = requiredScopes.filter(function(item) {
                return presentScopes.indexOf(item) != -1;
            });

            if (requestRule === this.rule.any && filtered.length === 0) {
                return false;
            }
            if (requestRule === this.rule.all && filtered.length != requiredScopes.length) {
                return false;
            }
            if (requestRule === this.rule.none && filtered.length > 0) {
                return false;
            }
        }

        return true;
    },

    scope: {
        tester: 'tester',
        client: 'client',
        qa: 'qa_manager',
        admin: 'admin'
    },

    rule: {
        any: 'any',
        none: 'none',
        all: 'all'
    }
};
