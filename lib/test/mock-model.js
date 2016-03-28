'use strict';

const _ = require('lodash');
const guid = require('guid');
const sinon = require('sinon');

/*eslint-disable no-console */
module.exports = function (){
    let data = {};
    let hashKey = 'guid';
    let createdAt = null;
    let nextGuids = [];
    let skipStubs = [];
    let sandboxInternal;
    let modelInternal;

    function getNextGuid() {
        if (nextGuids) {
            return nextGuids.shift();
        }
        return guid.raw();
    }

    function generateNextGuids(count) {
        count = count || 1;

        nextGuids = [];
        for (let i=0; i<count; i++) {
            nextGuids.push(guid.raw());
        }
        return nextGuids.length > 1 ? nextGuids: nextGuids[0];
    }

    function addMissingKeys(items) {
        return items.map(function(item) {
            if(!_.get(item, hashKey)) {
                return _.set(item, hashKey, getNextGuid());
            }
            return item;
        });
    }

    function addData(items) {
        if (!data) {
            data = {};
        }
        items = addMissingKeys(items);
        data = _.merge({}, data, _.keyBy(items, hashKey));
        console.log('/////////////', items);
        return this;
    }

    function setData(items) {
        data = {};
        return this.addData(items);
    }

    function getData() {
        return data;
    }

    function setCreationDate(timestamp) {
        createdAt = timestamp;
        return this;
    }

    function create(item) {
        item.createdAt = createdAt;
        item.guid = getNextGuid();
        return _.merge({}, item);
    }

    function restore() {
        return sandboxInternal.restore();
    }

    function sandbox() {
        return sandboxInternal;
    }

    function model() {
        return modelInternal;
    }

    function shouldStub(stub) {
        return skipStubs.indexOf(stub) < 0;
    }

    return {
        sandbox:sandbox,

        model:model,

        restore:restore,

        setData: setData,

        getData: getData,

        setCreationDate: setCreationDate,

        generateNextGuids: generateNextGuids,

        addData: addData,

        shouldStub: shouldStub,

        mock: function(_model, _sandbox, stubsToSkip, callback) {
            sandboxInternal = _sandbox || sinon.sandbox.create();
            modelInternal = _model;

            if (!stubsToSkip && _.isArray(arguments[arguments.length - 1])) {
                stubsToSkip = _sandbox;
            }
            skipStubs = stubsToSkip || [];

            hashKey = _model.hashKey;

            if(shouldStub('update')) {
                sandboxInternal.stub(modelInternal, 'update', function(item) {
                    console.log('UPDATE', item);
                    const key = _.get(item, hashKey);
                    return Promise.resolve(data[key] ? data[key]: null);
                });
            }

            if(shouldStub('create')) {
                sandboxInternal.stub(modelInternal, 'create', function(item) {
                    console.log('CREATE', item);
                    const created = create(item);
                    addData([created]);
                    return Promise.resolve(created);
                });
            }

            if(shouldStub('findItems')) {
                sandboxInternal.stub(modelInternal, 'findItems', function(keys) {
                    console.log('FINDITEMS', keys);
                    const filtered = _.filter(data, function(value, key) {
                        return keys.indexOf(key) > -1;
                    });
                    return Promise.resolve(filtered);
                });
            }

            if(shouldStub('find')) {
                sandboxInternal.stub(modelInternal, 'find', function(key) {
                    console.log('FIND', key);
                    const found = _.find(data, [hashKey, key]);
                    return Promise.resolve(found ? found: null);
                });
            }

            if(shouldStub('destroy')) {
                sandboxInternal.stub(model, 'destroy', function(key) {
                    console.log('DESTROY', key);
                    const found = _.find(data, [hashKey, key]);
                    _.remove(data, [hashKey, key]);
                    return found;
                });
            }

            callback(null, 1);
        }
    };
};
