'use strict';

const event = require('./event');
const context = require('./mock-context');
const test = require('./lambda-test');
const model = require('./mock-model');

module.exports = {
    event: event,
    context: context,
    test: test,
    model: model
};
