
var config = require('./configuration');

module.exports = {
    configuration: config(process.cwd())
};
