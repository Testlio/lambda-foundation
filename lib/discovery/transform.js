'use strict';

const through = require('through2');
const falafel = require('falafel');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

//
// This transform is used if/when lambda-foundation is browserified
// It is necessary to make discovery related resources static
//
module.exports = function(file) {
    const target = 'discovery/index.js';

    if (file.indexOf(target) !== file.length - target.length) {
        return through();
    }

    // Create an AST of the code
    const contents = fs.readFileSync(file, 'utf8');
    const output = falafel(contents, { ecmaVersion: 6 }, function(node) {
        if (node.type === 'CallExpression') {
            if (node.callee.name === 'loadDiscovery') {
                let fileName = node.arguments[0].source();

                try {
                    // Try to evaluate the fileName to then load the config
                    const sandbox = {
                        path: path,
                        resourcesFile: process.env.LAMBDA_DISCOVERY_FILE ||path.join(process.cwd(), 'discovery.json')
                    };

                    fileName = vm.runInNewContext(fileName, sandbox);

                    // Trim whitespace from contents
                    node.update(fs.readFileSync(fileName, 'utf8').trim());
                } catch (err) {
                    // Ignore, the source can't be reasonably resolved
                }
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
