'use strict';

const tape = require('tape');
const path = require('path');
const discovery = require('../lib/discovery');

tape.test('Loading simple discovery resources', function(t) {
    const resolvedConfig = discovery('http://localhost', path.resolve(__dirname, 'discovery/1.json'));
    const comparison = {
        resources: {
            people: {
                href: 'http://localhost/people'
            },

            animals: {
                href: 'http://localhost/animals'
            }
        }
    };

    t.plan(1);
    t.same(resolvedConfig, comparison, 'Simple discovery resources are not loaded properly');
});

tape.test('Loading nested discovery resources', function(t) {
    const resolvedConfig = discovery('http://localhost', path.resolve(__dirname, 'discovery/2.json'));
    const comparison = {
        resources: {
            people: {
                href: 'http://localhost/people',
                children: {
                    href: 'http://localhost/people/children'
                }
            }
        }
    };

    t.plan(1);
    t.same(resolvedConfig, comparison, 'Simple discovery resources are not loaded properly');
});

tape.test('Loading complex nested discovery resources', function(t) {
    const resolvedConfig = discovery('http://localhost', path.resolve(__dirname, 'discovery/3.json'));
    const comparison = {
        resources: {
            people: {
                adults: {
                    href: 'http://localhost/people/adults'
                },
                children: {
                    href: 'http://localhost/people/children',
                    infants: {
                        href: 'http://localhost/people/children/infants'
                    }
                }
            }
        }
    };

    t.plan(1);
    t.same(resolvedConfig, comparison, 'Simple discovery resources are not loaded properly');
});

tape.test('Loading discovery resources with different base URL', function(t) {
    const resolvedConfig = discovery('https://api.testlio.com', path.resolve(__dirname, 'discovery/1.json'));
    const comparison = {
        resources: {
            people: {
                href: 'https://api.testlio.com/people'
            },

            animals: {
                href: 'https://api.testlio.com/animals'
            }
        }
    };

    t.plan(1);
    t.same(resolvedConfig, comparison, 'Simple discovery resources are not loaded properly');
});
