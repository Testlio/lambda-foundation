var through = require('through2');
var falafel = require('falafel');
var fs = require('fs');

function loadDefaultConfig() {
    try {
        return JSON.parse(fs.readFileSync(process.cwd() + '/config/default.json'));
    } catch (err) {
        return {};
    }
}

function loadEnvironmentConfig() {
    try {
        var environment = process.env.NODE_ENV || 'development';
        return JSON.parse(fs.readFileSync(process.cwd() + '/config/' + environment + '.json'));
    } catch (err) {
        return {};
    }
}

function loadEnvironmentVariablesConfig() {
    try {
        var contents = fs.readFileSync(process.cwd() + '/config/custom-environment-variables.json', 'utf8');
        var regex = /:\s* (?:"([^"\\]*(?:\\.)?)*")/g;
        return contents.replace(regex, function(match, group) {
            return ': process.env.' + group;
        });
    } catch (err) {
        return '{}';
    }
}

module.exports = function(file) {
    var target = 'configuration/index.js';

    if (file.indexOf(target) !== file.length - target.length) {
        return through();
    }

    // Create an AST of the code
    var contents = fs.readFileSync(file, 'utf8');
    var output = falafel(contents, function(node) {
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

    var written = false;
    return through(function(buf, enc, next) {
        if (!written) {
            written = true;
            this.push(output.toString());
        }

        next();
    });
};
