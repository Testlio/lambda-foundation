"use strict";

const config = require('./configuration');
const path = require('path');

module.exports = {
    configuration: config(path.resolve(process.cwd(), 'config'))
};
