"use strict";

const config = require('./lib/configuration');
const path = require('path');

module.exports = {
    configuration: config(path.resolve(process.cwd(), 'config'))
};
