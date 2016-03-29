const tape = require('tape');
const MockModel = require('../lib/test/mock-model');
const sandbox = require('sinon').sandbox;
const Model = require('../lib/model');

const Device = Model('Devices', {
    hashKey : 'guid',
    timestamps : true,
    indexes: [{
        hashKey: 'identifier',
        name: 'IdentifierIndex',
        type: 'global'
    }]
});

tape.test('Mock model test', function(t) {
    const mockModel = new MockModel();
    mockModel.mock(Device, sandbox);
    t.ok(mockModel.sandbox(), 'Sandbox is provided');
    t.ok(mockModel.model(), 'Model is provided');
    t.same(mockModel.sandbox().fakes.length, 5, 'Stubbed 5 functions');
    t.same(mockModel.sandbox().fakes[0].displayName, 'update', 'Update function is stubbed');
    t.same(mockModel.sandbox().fakes[1].displayName, 'create', 'Create function is stubbed');
    t.same(mockModel.sandbox().fakes[2].displayName, 'findItems', 'FindItems function is stubbed');
    t.same(mockModel.sandbox().fakes[3].displayName, 'find', 'Find function is stubbed');
    t.same(mockModel.sandbox().fakes[4].displayName, 'destroy', 'Destroy function is stubbed');
    t.end();
});

tape.test('Mock model set data test', function(t) {
    const mockModel = new MockModel();
    const modelGuid = mockModel.generateNextGuids(1);
    mockModel.setData([{data: 'data'}]);
    t.ok(mockModel.getData(), 'Data is provided');
    t.same(mockModel.getData(), {[modelGuid]: {data: 'data', guid: modelGuid}}, 'Data is right');
    t.end();
});

tape.test('Mock model restore test', function(t) {
    sandbox.restore();
    const mockModel = new MockModel();
    mockModel.mock(Device, sandbox);
    mockModel.restore();
    t.ok(mockModel.sandbox(), 'Sandbox is provided');
    t.same(mockModel.sandbox().fakes.length, 0, 'Sandbox is restored');
    t.end();
});

tape.test('Mock model find test', function(t) {
    sandbox.restore();
    const mockModel = new MockModel();
    mockModel.mock(Device, sandbox);
    mockModel.setData([{guid: '0', name: 'test0'}, {guid: '1', name: 'test1'}, {guid: '2', name: 'test2'}]);
    Device.find('1').then(function(result) {
        t.same(result, {guid: '1', name: 'test1'}, 'Find item is ok');
        t.end();
    });
});

tape.test('Mock model findItems test', function(t) {
    sandbox.restore();
    const mockModel = new MockModel();
    mockModel.mock(Device, sandbox);
    mockModel.setData([{guid: '0', name: 'test0'}, {guid: '1', name: 'test1'}, {guid: '2', name: 'test2'}]);
    Device.findItems(['1', '2']).then(function(result) {
        t.same(result, [{guid: '1', name: 'test1'}, {guid: '2', name: 'test2'}], 'Find items is ok');
        t.end();
    });
});

tape.test('Mock model update test', function(t) {
    sandbox.restore();
    const mockModel = new MockModel();
    mockModel.mock(Device, sandbox);
    mockModel.setData([{guid: '0', name: 'test0'}, {guid: '1', name: 'test1'}, {guid: '2', name: 'test2'}]);
    Device.update({guid: '1', name: 'test3'}).then(function(result) {
        t.same(result, {guid: '1', name: 'test1'}, 'Update item is ok');
        t.end();
    });
});

tape.test('Mock model create test', function(t) {
    sandbox.restore();
    const mockModel = new MockModel();
    mockModel.mock(Device, sandbox);
    mockModel.setData([{guid: '0', name: 'test0'}, {guid: '1', name: 'test1'}, {guid: '2', name: 'test2'}]);
    const guid = mockModel.generateNextGuids(1);
    mockModel.setCreationDate(123456);
    Device.create({name: 'test3'}).then(function(result) {
        t.same(result, {guid: guid, name: 'test3', createdAt: 123456}, 'Create item is ok');
        t.end();
    });
});

tape.test('Mock model destroy test', function(t) {
    sandbox.restore();
    const mockModel = new MockModel();
    mockModel.mock(Device, sandbox);
    mockModel.setData([{guid: '0', name: 'test0'}, {guid: '1', name: 'test1'}, {guid: '2', name: 'test2'}]);
    Device.destroy('1').then(function(result) {
        t.same(result, {guid: '1', name: 'test1'}, 'Destroy item is ok');
        t.end();
    });
});
