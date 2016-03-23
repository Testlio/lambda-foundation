'use strict';

const _ = require('lodash');
const guid = require('guid');
const sinon = require('sinon');

/*eslint-disable no-console */
module.exports = function (){
    let data = {};
    let hashKey = 'guid';
    let createdAt = 0;
    let nextGuid = guid.raw();
    let skipStubs = [];
    let sandboxInternal;

    function generateGuid() {
        const currentGuid = nextGuid;
        nextGuid = guid.raw();
        return currentGuid;
    }

    function create(item) {
        item.createdAt = createdAt;
        item.guid = generateGuid();
        return _.merge({}, item);
    }

    function addMissingKeys(items) {
        return items.map(function(item) {
            if(!_.get(item, hashKey)) {
                return _.set(item, hashKey, guid.raw());
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

    function getNextGuid() {
        return nextGuid;
    }

    function restore() {
        return sandboxInternal.restore();
    }

    function sandbox() {
        return sandboxInternal;
    }

    function shouldStub(stub) {
        return skipStubs.indexOf(stub) < 0;
    }

    return {
        sandbox:sandbox,

        restore:restore,

        setData: setData,

        getData: getData,

        setCreationDate: setCreationDate,

        getNextGuid:getNextGuid,

        addData: addData,

        shouldStub: shouldStub,

        mock: function(model, _sandbox, stubsToSkip) {
            sandboxInternal = _sandbox || sinon.sandbox.create();

            if (!stubsToSkip && _.isArray(arguments[arguments.length - 1])) {
                stubsToSkip = _sandbox;
            }
            skipStubs = stubsToSkip || [];

            hashKey = model.hashKey;

            if(shouldStub('update')) {
                sandboxInternal.stub(model, 'update', function(item) {
                    console.log('UPDATE', item);
                    const key = _.get(item, hashKey);
                    return Promise.resolve(data[key] ? data[key]: null);
                });
            }

            if(shouldStub('create')) {
                sandboxInternal.stub(model, 'create', function(item) {
                    console.log('CREATE', item);
                    const created = create(item);
                    console.log('CREATED', addData);
                    addData([created]);
                    return Promise.resolve(created);
                });
            }

            if(shouldStub('findItems')) {
                sandboxInternal.stub(model, 'findItems', function(keys) {
                    console.log('FINDITEMS', keys);
                    const filtered = _.filter(data, function(value, key) {
                        return keys.indexOf(key) > -1;
                    });
                    return Promise.resolve(filtered);
                });
            }

            if(shouldStub('find')) {
                sandboxInternal.stub(model, 'find', function(key) {
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

            return this;
        }
    };
};
