'use strict';

const _ = require('lodash');
const mockModel = require('../mock-model');

const deviceModel = function() { };

const devices = [
    {
        guid: '0',
        createdAt: '2016-03-01T12:16:29+00:00',
        type: 'phone',
        manufacturer: 'Manufacturer',
        model: '1.2.3',
        identifier: 'phone-manufacturer-123',
        capabilities: {'key': 'value'},
        operatingSystems: [
            '44132991-52b3-4aa4-adc7-84cee71d4df6',
            '576f52f6-a16c-4303-b518-9fb6fa4f499e',
            '4023c1e2-6f71-43b5-90d1-c118686d86c2'
        ]
    },
    {
        guid: '1',
        createdAt: '2015-03-01T12:16:29+00:00',
        type: 'reader',
        manufacturer: 'Apple',
        model: '1.2.4',
        identifier: 'phone-manufacturer-124',
        capabilities: {'key': 'value'},
        operatingSystems: [
            '44132991-52b3-4aa4-adc7-84cee71d4df6',
            '576f52f6-a16c-4303-b518-9fb6fa4f499e',
            '4023c1e2-6f71-43b5-90d1-c118686d86c2'
        ]
    },
    {
        guid: '2',
        createdAt: '2014-03-01T12:16:29+00:00',
        type: 'laptop',
        manufacturer: 'Windows',
        model: '1.2.5',
        identifier: 'phone-manufacturer-125',
        capabilities: {'key': 'value'},
        operatingSystems: [
            '44132991-52b3-4aa4-adc7-84cee71d4df6',
            '576f52f6-a16c-4303-b518-9fb6fa4f499e',
            '4023c1e2-6f71-43b5-90d1-c118686d86c2'
        ]
    },
    {
        guid: '3',
        createdAt: '2013-03-01T12:16:29+00:00',
        type: 'browser',
        manufacturer: 'Google',
        model: '1.2.6',
        identifier: 'phone-manufacturer-126',
        capabilities: {'key': 'value'},
        operatingSystems: [
            '44132991-52b3-4aa4-adc7-84cee71d4df6',
            '576f52f6-a16c-4303-b518-9fb6fa4f499e',
            '4023c1e2-6f71-43b5-90d1-c118686d86c2'
        ]
    }];

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

function mockDeviceModel(model) {
    model.sandbox().stub(model.model(), 'findItems', function(guids) {
        const returnDevices = guids.map(function(guid) {
            return devices[guid];
        });
        return Promise.resolve(returnDevices);
    });
    return this;
}

deviceModel.mock = function(_model, _sandbox) {
    return mockModelThunk(this._parent.mock)(_model, _sandbox, null).then(mockDeviceModel(this));
};

module.exports = function() {
    const MockModel = new mockModel();
    const Model = function() {};
    Model._parent = MockModel;
    _.extend(Model, MockModel);
    return _.extend(Model, deviceModel);
};
