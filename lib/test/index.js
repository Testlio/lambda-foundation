const event = require('./event');
const context = require('./mock-context');
const test = require('./lambda-test');

module.exports = {
    event: event,
    context: context,
    test: test
};
