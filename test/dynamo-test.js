'use strict';

const tape = require('tape');
const vogels = require('vogels');
const Promise = require('promiscuous');
const localDynamo = require('local-dynamo');

const defaultTimeout = 10000;

// Use local DynamoDB instance
const port = 4567;
const dynamodb = new vogels.AWS.DynamoDB({endpoint: 'http://localhost:' + port, region: 'us-east-1'});
vogels.dynamoDriver(dynamodb);

module.exports = {
    scan: function(table, callback) {
        const params = {
            'TableName': table.tableName()
        };

        dynamodb.scan(params, callback);
    },

    test: function(groupName, options, testFunction) {
        if (Function.prototype.isPrototypeOf(options)) {
            options = {};
        } else {
            options = options || {};
        }

        options.timeout = options.timeout || defaultTimeout;
        testFunction = testFunction || Array.prototype.slice.call(arguments).slice(-1)[0] || function() {};

        vogels.models = options.models;
        const tables = Object.keys(vogels.models).map(function(key) {
            return vogels.models[key];
        });

        let dynamoProcess;

        tape.test(groupName + ' - Set up', function(st) {
            new Promise(function(resolve, reject) {
                // Launch local dynamo process
                dynamoProcess = localDynamo.launch('', port);

                // Create tables
                vogels.createTables(function(err) {
                    if (err) return reject(err);
                    resolve();
                });
            }).then(function() {
                // Populate with test data (if any)
                const testData = options.testData;
                if (testData) {
                    const promises = tables.map(function(table) {
                        const tableName = table.tableName();
                        if (testData[tableName]) {
                            return table.create(testData[tableName]);
                        }
                    });
                    return new Promise.all(promises);
                }
            }).then(function() {
                st.end();
            }).catch(function(err) {
                st.end(err);
            });
        });

        // Queue actual tests
        testFunction(tape);

        // Queue tear down
        tape.test(groupName + ' - Tear down', function(st) {
            const promises = tables.map(function(table) {
                return new Promise(function(resolve) {
                    table.deleteTable(function() {
                        resolve();
                    });
                });
            });

            Promise.all(promises).then(function() {
                dynamoProcess.on('close', function() {
                    st.end();
                });

                dynamoProcess.kill();
            }).catch(function() {
                dynamoProcess.on('close', function() {
                    st.end();
                });

                dynamoProcess.kill();
            });
        });
    }
};
