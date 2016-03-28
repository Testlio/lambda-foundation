'use strict';

const _ = require('lodash');
const mockModel = require('../mock-model');

const cloudsearchUtilModel = function() { };

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

function mockCloudsearchUtilModel(model) {
    model.sandbox().stub(model.model(), 'getCloudSearchDomain', function() {
        return new Promise(function(resolve) {
            resolve({
                uploadDocuments: function(params, callback) {
                    const documents = JSON.parse(params.documents);

                    // Always succeed
                    const adds = documents.filter(function(document) {
                        return document.type === 'add';
                    });

                    const deletes = documents.filter(function(document) {
                        return document.type === 'delete';
                    });

                    callback(null, { status: 'Success', adds: adds.length, deletes: deletes.length });
                }
            });
        });
    });
    return this;
}

cloudsearchUtilModel.mock = function(_model, _sandbox) {
    return mockModelThunk(this._parent.mock)(_model, _sandbox, null).then(mockCloudsearchUtilModel(this));
};

module.exports = function() {
    const MockModel = new mockModel();
    const Model = function() {};
    Model._parent = MockModel;
    _.extend(Model, MockModel);
    return _.extend(Model, cloudsearchUtilModel);
};
