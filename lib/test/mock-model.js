'use strict';
const _ = require('lodash');
const guid = require('guid');

module.exports = function (){
    let data = [];
    let hashKey = 'guid';
    let createdAt = 0;
    let nextGuid = guid.raw();

    function generateGuid() {
        const currentGuid = nextGuid;
        nextGuid = guid.raw();
        return currentGuid;
    }

    return {
        setData: function(_data) {
            _data = _data.map(function(item) {
                if(!_.get(item, hashKey)) {
                    return _.set(item, hashKey, guid.raw());
                }
                return item;
            });
            data = _.keyBy(_data, hashKey);
            return this;
        },

        getData: function() {
            return data;
        },

        setCreationDate(_createdAt) {
            createdAt = _createdAt;
            return this;
        },

        getNextGuid() {
            return nextGuid;
        },

        mock: function(sandbox, model) {

            hashKey = model.hashKey;

            sandbox.stub(model, 'update', function(item) {
                if(data[_.get(item, hashKey)]) {
                    return Promise.resolve(data[_.get(item, hashKey)]);
                } else {
                    Promise.reject('not found');
                }
            });

            sandbox.stub(model, 'create', function(item) {
                item.createdAt = createdAt;
                item.guid = generateGuid();
                data[item.guid] = item;
                return Promise.resolve(item);
            });

            sandbox.stub(model, 'findItems', function(keys) {
                const filtered = _.filter(data, function(value, key) {
                    return keys.indexOf(key) > -1;
                });
                return Promise.resolve(filtered);
            });

            sandbox.stub(model, 'find', function(key) {
                const filtered = _.filter(data, function(value, _key) {
                    return key === _key;
                });
                return Promise.resolve(filtered ? filtered[0]: null);
            });

            sandbox.stub(model, 'destroy', function(key) {
                const filtered = _.filter(data, function(value, _key) {
                    return key === _key;
                });
                const found = filtered ? filtered[0]: null;
                if (found) {
                    _.remove(data, function(value, _key) {
                        return key === _key;
                    });
                }
                return found;
            });

            return this;
        }
    };
};
