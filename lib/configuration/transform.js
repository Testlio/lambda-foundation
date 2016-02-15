'use strict';

const through = require('through2');
const falafel = require('falafel');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadConfig(file) {
    try {
        return fs.readFileSync(file, 'utf8');
    } catch (err) {
        return '{}';
    }
}

function loadEnvironmentVariablesConfig(fileName) {
    try {
        const contents = fs.readFileSync(fileName, 'utf8');
        const regex = /:\s* (?:"([^"\\]*(?:\\.)?)*")/g;
        return contents.replace(regex, function(match, group) {
            return ': process.env.' + group;
        });
    } catch (err) {
        return '{}';
    }
}

//
// This transform is used if/when lambda-foundation is browserified
// It is necessary to make configuration static and bundle-able,
// by loading in the necessary files at bundling time. Furthermore
// this transforms works especially well with envify as it transforms
// the configuration submodule into one that contains process.env type
// constants that envify can easily replace.
//
module.exports = function(file) {
    const target = 'configuration/index.js';

    if (file.indexOf(target) !== file.length - target.length) {
        return through();
    }

    // Create an AST of the code
    const contents = fs.readFileSync(file, 'utf8');
    const output = falafel(contents, { ecmaVersion: 6 }, function(node) {
        if (node.type === 'CallExpression') {
            if (node.callee.name === 'loadConfig' || node.callee.name == 'loadEnvironmentVariablesConfig') {
                let fileName = node.arguments[0].source();

                // Try to evaluate the fileName to then load the config
                const sandbox = {
                    path: path,
                    environment: process.env.NODE_ENV || 'development',
                    configurationDirectory: path.resolve(process.cwd(), 'config')
                };

                fileName = vm.runInNewContext(fileName, sandbox);

                let contents;
                if (node.callee.name === 'loadConfig') {
                    contents = loadConfig(fileName);
                } else {
                    contents = loadEnvironmentVariablesConfig(fileName);
                }

                // Trim whitespace from contents
                contents = contents.trim();
                node.update(contents);
            }
        }
    });

    let written = false;
    return through(function(buf, enc, next) {
        if (!written) {
            written = true;
            this.push(output.toString());
        }

        next();
    });
};
