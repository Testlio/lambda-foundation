'use strict';

const Raygun = require('raygun');

let RaygunClient;
const isProduction = (process.env.NODE_ENV === 'production');
const apiKey = process.env.RAYGUN_APIKEY;

if (!isProduction) {
    console.log('Raygun not initialized - env ', process.env.NODE_ENV); //eslint-disable-line no-console

    if (!apiKey) {
        console.log('Raygun not initialized - missing API key'); //eslint-disable-line no-console
    }
}

if (apiKey && isProduction) {
    RaygunClient = new Raygun.Client().init({ apiKey: apiKey });
} else {
    RaygunClient = {
        send: function(error, extra, cb) {
            cb();
        }
    };
}

module.exports = {
    send: function(error, extra, cb, request, tags) {
        RaygunClient.send(error, extra, cb, request, tags);
    },

    config: function(config) {
        let key = apiKey;

        if (config.apiKey) {
            key = config.apiKey;
        }

        if (key && isProduction) {
            RaygunClient = new Raygun.Client().init({ apiKey: key });
        } else {
            RaygunClient = {
                send: function(error, extra, cb) {
                    cb();
                }
            };
        }
    }
};
