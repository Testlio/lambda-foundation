'use strict';

const through = require('through2');
const falafel = require('falafel');
const fs = require('fs');

function loadDefaultConfig() {
    try {
        return JSON.parse(fs.readFileSync(process.cwd() + '/config/default.json'));
    } catch (err) {
        return {};
    }
}

function loadEnvironmentConfig() {
    try {
        const environment = process.env.NODE_ENV || 'development';
        return JSON.parse(fs.readFileSync(process.cwd() + '/config/' + environment + '.json'));
    } catch (err) {
        return {};
    }
}

function loadEnvironmentVariablesConfig() {
    try {
        const contents = fs.readFileSync(process.cwd() + '/config/custom-environment-variables.json', 'utf8');
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
    const output = falafel(contents, function(node) {
        if (node.type === 'FunctionDeclaration') {
            // We are interested in only few of the functions
            // namely the ones that do the loading of the configs
            if (node.id.name === 'loadDefaultConfig') {
                node.body.update("{\n\treturn " + JSON.stringify(loadDefaultConfig()) + ";\n}");
            } else if (node.id.name === 'loadEnvironmentConfig') {
                node.body.update("{\n\treturn " + JSON.stringify(loadEnvironmentConfig()) + ";\n}");
            } else if (node.id.name === 'loadEnvironmentVariablesConfig') {
                node.body.update("{\n\treturn " + loadEnvironmentVariablesConfig() + ";\n}");
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
