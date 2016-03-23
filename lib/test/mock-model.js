'use strict';

const _ = require('lodash');
const guid = require('guid');

/*eslint-disable no-console */
module.exports = function (){
    let data = {};
    let hashKey = 'guid';
    let createdAt = 0;
    let nextGuid = guid.raw();

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

    return {
        setData: function(_data) {
            data = [];
            return this.addData(_data);
        },

        getData: function() {
            return data;
        },

        setCreationDate: function(_createdAt) {
            createdAt = _createdAt;
            return this;
        },

        getNextGuid: function() {
            return nextGuid;
        },

        addData: addData,

        mock: function(sandbox, model) {

            hashKey = model.hashKey;

            sandbox.stub(model, 'update', function(item) {
                console.log('UPDATE', item);
                const key = _.get(item, hashKey);
                return Promise.resolve(data[key] ? data[key]: null);
            });

            sandbox.stub(model, 'create', function(item) {
                console.log('CREATE', item);
                const created = create(item);
                console.log('CREATED', addData);
                addData([created]);
                return Promise.resolve(created);
            });

            sandbox.stub(model, 'findItems', function(keys) {
                console.log('FINDITEMS', keys);
                const filtered = _.filter(data, function(value, key) {
                    return keys.indexOf(key) > -1;
                });
                return Promise.resolve(filtered);
            });

            sandbox.stub(model, 'find', function(key) {
                console.log('FIND', key);
                const found = _.find(data, [hashKey, key]);
                return Promise.resolve(found ? found: null);
            });

            sandbox.stub(model, 'destroy', function(key) {
                console.log('DESTROY', key);
                const found = _.find(data, [hashKey, key]);
                _.remove(data, [hashKey, key]);
                return found;
            });

            return this;
        }
    };
};
