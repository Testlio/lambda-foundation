'use strict';

module.exports = {
    error: function(code, message, info) {
        const error = new Error(`${code}: ${message}`);
        error.info = info;
        error.code = code;

        return error;
    }
};
