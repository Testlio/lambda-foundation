'use strict';

const _ = require('lodash');
const mockModel = require('../mock-model');

const operatingSystemModel = function() { };

const operatingSystems = [
    {
        guid: '44132991-52b3-4aa4-adc7-84cee71d4df6',
        name: 'OpSys1',
        version: '1.2'
    },
    {
        guid: '576f52f6-a16c-4303-b518-9fb6fa4f499e',
        name: 'OpSys2',
        version: '2.2'
    },
    {
        guid: '4023c1e2-6f71-43b5-90d1-c118686d86c2',
        name: 'OpSys3',
        version: '3.2'
    }
];

function mockModelThunk(fn) {
    return function() {
        const args = [].slice.call(arguments);
        return new Promise(function(resolve, reject) {
            function resolver(err, result) {
                if (err) return reject(new Error(500, err.message));
                resolve(result);
            }
            fn.apply(fn, args.concat(resolver));
        });
    };
}

function mockOperatingSystemModel(model) {
    model.sandbox().stub(model.model(), 'findItems', function() {
        return Promise.resolve(operatingSystems);
    });
    return this;
}

operatingSystemModel.mock = function(_model, _sandbox) {
    return mockModelThunk(this._parent.mock)(_model, _sandbox, null).then(mockOperatingSystemModel(this));
};

module.exports = function() {
    const MockModel = new mockModel();
    const Model = function() {};
    Model._parent = MockModel;
    _.extend(Model, MockModel);
    return _.extend(Model, operatingSystemModel);
};
