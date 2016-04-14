# Lambda Foundation

**This package is deprecated, please use the descoped package [lambda-foundation](https://npmjs.com/package/lambda-foundation) instead**

[![Circle CI status](https://circleci.com/gh/Testlio/lambda-foundation.svg?style=svg&circle-token=279b8c8c389637b8f81b9f6dd2da434cc76a530a)](https://circleci.com/gh/Testlio/lambda-foundation)

Lambda Foundation contains various shared parts that [AWS Lambda](https://aws.amazon.com/lambda/) backed microservices need and use. In its current state this package aims to simplify authentication, error reporting, service discovery (including URL resolving) and configuration.

## Installation and Usage

```js
npm install @testlio/lambda-foundation
```

Then in code, you can import the entire foundation by:

```js
var Foundation = require('@testlio/lambda-foundation');
```

Notice that this package aims to be modular, allowing you direct access to the parts that are more important, for example to only get authentication, you can do either of the following:

```js
var Auth = require('@testlio/lambda-foundation/authentication');
var Auth = require('@testlio/lambda-foundation').authentication;
```

## Parts

### Authentication

Authentication is an asynchronous process, that assumes the event contains a value under the `authorization` key. This value could be a pure OAuth token or it could be a full header (with type prefix). The API returns a promise that fails if the context is not properly authenticated. Upon success, the promise resolves the token into its claims, which in general contain a `sub`, `exp` and `iat` keys as per the [JWT spec](http://jwt.io/introduction/).

```js
var Auth = require('@testlio/lambda-foundation').authentication;

function handler(event, context) {
    let authPromise = Auth.authenticate(event.authorization);

    authPromise.then(function(jwt) {
        console.log('Hi, ' + jwt.sub);
        ...
    });
}
```

The secret, against which the token is validated can be configured in multiple ways. By default the secret is `default_secret`, unless the environment variable `AUTH_SECRET` is set on `process.env`, in which case that value is used. Finally, the secret can be overriden in code via `auth.config()`.

```js
var Auth = require('@testlio/lambda-foundation').authentication;
Auth.config({
    secret: 'new_secret'
});

function handler(event, context) {
    // code like before, now authentication is done against new_secret
}

```

The authentication submodule also includes constants for scopes and allows both authentication against a specific scope as well as offering a utility function for manually checking if a specific JWT has specific scope(s).

```js
var Auth = require('@testlio/lambda-foundation').authentication;

function handler(event, context) {
    // We can provide a set of scopes and a rule that the event has to satisfy
    // the rule defaults to "All", but can also be "Any" or "None"
    let authPromise = Auth.authenticate(event.authorization, {
        scopes: ['admin', 'user'],
        rule: Auth.RULE.ANY
    });

    authPromise.then(function(jwt) {
        // We now know that the user is either a client or an admin
        console.log('Hi, ' + jwt.sub);

        // We can check which exactly was satisfied
        if (auth.verifyScopes(jwt, { scopes: ['admin'] })) {
            // Admin
        } else {
            // Client
        }

        ...
    }).catch(function(err) {
        // Either the event was not properly authenticated or the scope
        // rule wasn't satisfied
    });
}
```

_Note:_ The errors thrown by authentication start with either `401:` or `403:`, depending on the reason (not matching scope vs having an invalid token). This means the AWS Lambda function results in a string that matches the regex `4\\d{2}:.*`

### Service Discovery

At the root of every microservice should be a discovery method for publicly accessible resources. Generally the structure of this discovery response is very similar between various services, which the Foundation aims to simplify. Furthermore, all services also rely on similar code for resolving/completing the HREFs present in the responses.

For example, a service may have a resource `pet` and expose methods for obtaining all `pets` for a user or a specific `pet`. The discovery response would in that case be something along the lines of:

```json
{
    "resources": {
        "pets": {
            "href": "http://host/service/version/pets"
        }
    }
}
```

Responses to further methods/endpoints can also include HREFs to themselves and/or other resources:

```json
{
    "href": "http://host/service/version/pets/id",
    "name": "Bob",
    "type": "Dog"
}
```

The `discovery` submodule of Lambda Foundation aims to help with both of these steps by reading a file from the service (`discovery.json`) that defines the resources. Nested resources are also allowed (paths of resulting HREFs are assumed to nest). Notice this is very similar to the response format, but doesn't include the HREFs in the definition (as those are generated dynamically). If a resource wishes to not have a HREF generated (it is not directly accessible and serves as a passthrough for its children for example), it can specify the `passthrough` flag as `true`.

```json
{
    "resources": {
        "pets": {},
        "people": {
            "passthrough": true,
            "resources": {
                "children": {},
                "adults": {}
            }
        }
    }
}
```

This results in resolved resources:

```json
{
    "resources": {
        "pets": {
            "href": "http://host/service/version/pets"
        },
        "people": {
            "children": {
                "href": "http://host/service/version/people/children"
            },
            "adults": {
                "href": "http://host/service/version/people/adults"
            }
        }
    }
}
```

In code these generated resources can be accessed directly:

```js
var Discovery = require('@testlio/lambda-foundation').discovery;

function handler(event, context) {
    var resources = Discovery.resources;
    context.succeed(resources);
}
```

Discovery also helps with resolving HREFs for use in responses. This works hand in hand with Node.js's [URL module](https://nodejs.org/api/url.html).

```js
var Discovery = require('@testlio/lambda-foundation').discovery;
var url = require('url');

function handler(event, context) {
    ...
    // HREF for a specific pet
    var href = url.resolve(Discovery.resources.pets.href, '/specific-pet-id');

    // HREF for all pets (the top-level resource)
    var generalHref = Discovery.resources.pets.href;

    // HREF for a nested resource
    var childrenHref = Discovery.resources.people.children.href;
    ...
}
```

### Configuration

As Lambda based services that are deployed using [lambda-tools](https://github.com/testlio/lambda-tools) undergo a bundling/browserifying/minifying process, which aims to reduce the entire Lambda function down to a single minified file. This process doesn't work well with the [config](https://npmjs.org/packages/config) package due to its dynamic require statements.

This problem could be solved in multiple ways, for example the config package could be ignored by bundling and then separately included in the resulting zipped up Lambda function. However, there may exist services which don't care about configuration, or want to handle it without using the aforementioned config package. Thus, Lambda Foundation aims to provide a simpler, more browserify friendly configuration method, which also provides some out of the box values that Lambda functions are likely to care about.

Configuration utilises a similar approach to the config package, leveraging files in the `config` directory. The biggest difference is in the way lambda-foundation configuration is bundled/built into a static file by browserify. As expected, configurations in the `config` directory are loaded based on the environment, with `default` used as a fallback. All environment mappings defined in `custom-environment-variables` are also loaded at initialisation time to allow bundling.

```js
var Config = require('@testlio/lambda-foundation').configuration;

function handler(event, context) {
    ...
    // Read a value from configuration
    var projectName = Config.project.name;
    ...
}
```

### Error Reporting

Reporting errors from Lambda functions involves two steps, first the error has to be caught and reported, second the context should fail with the same error once the reporting code has finished. Foundation uses promises once again to offer error reporting facilities, which `context.fail` can then be chained into. At the moment the error reporting is synchronous (as a process), meaning once the promise resolves the error has been reported to the centralised system. This means a small overhead on Lambda invocations that result in an error. However, this may change in the future, into a system where errors are batched and propagated separately from the Lambda functions that reported them.

The general error reporting function works as follows:

```js
var Error = require('@testlio/lambda-foundation').error;

function handler(event, context) {
    let work = ...// some promise

    promise.then(context.done).catch(function (err) {
        return Error.report(err).then(context.fail);
    });
}
```

All errors that don't start with the following pattern `\\d{3}:` are assumed to be internal errors and are transformed into errors that have `500: ` at the start of their `message`.

The error submodule also aims to provide structure for errors used in Lambda functions. This is due to the way Lambda results are interpreted by [API Gateway](https://aws.amazon.com/api-gateway/), where the error is converted into a string, that in turn gets mapped to an HTTP response. Thus, a nice pattern is to provide the suggested status code as the first part of the error message, such as `500:` or `404:`. Such error messages can be created as follows:

```js
var Error = require('@testlio/lambda-foundation').error;

function handler(event, context) {
    let work = new Promise(function(resolve, reject) {
        // Check some variable on event, which if not there, should result in a 400
        if (!event.variable) {
            return reject(new Error('400', 'Missing variable'));
        }

        // Everything is fine and work can continue
        ...
    }).then(context.done).catch(function(err) {
        return Error.report(err).then(context.fail);
    });
}
```

If the environment variable `RAYGUN_API_KEY` is set to a valid [Raygun](https://raygun.io) API key, then the errors are also reported there upon calls to `.report`. Furthermore, errors are only reported when the `NODE_ENV` environment variable is set to `production`.

### Model layer

Big part of any service is data, in Lambda backed microservices, that data is usually kept in DynamoDB. In order to standardise this as well as make it more convenient to use from the Lambda function, Foundation includes a separate submodule for defining and interacting with models. The model layer is largely based on [vogels](https://github.com/ryanfitz/vogels), but offers an API that uses promises, which better suit the workflow Foundation proposes.

In a service, a model object/type can be defined as follows:

```js
var model = require('@testlio/lambda-foundation').model;
var joi = require('joi');

const example = model('Example', {
    hashKey : 'guid',
    timestamps : true,
    schema : {
        guid: model.types.uuid(),
        type: joi.string(),
        name: joi.string()
    },
    indexes: [{
        hashKey: 'guid',
        name: 'ExampleIndex',
        type: 'global'
    }]
});

module.exports = example;
```

The API mimics that of Vogels, but is promisified, thus allowing for better chaining:

```js
example.create({ guid: '111', type: 'example', name: 'Name' }).then(function(value) {
    console.log(value.name) // outputs 'Name'
});
```

APIs that are promisified include: `find`, `findItems`, `create`, `update`, `destroy`, `query` and `scan`. It is worth noting that the object returned from the `model()` function used above has all the same properties as a Vogels' table would, and it can be extended to fit the custom needs of the service (for example by adding a custom `findByVariable` function).

The model layer also automatically configures the underlying Vogels/DynamoDB connection to use the appropriate table. This uses the provided model object name along with the project name and stage to build the table name. **The model name is converted to kebab-case in the table name**.


### Testing

Our testing module provides three main submodules described below.

#### Context

We provide a mock context for easier verification of lambda function results. Our mock context does depend on [Tape](https://www.npmjs.com/package/tape) and handles basic result assertion and test ending. Lambda is considered to have successfully executed if it terminates with either `context.succeed(result)` or `context.done(null, result)`.

The following examples both demonstrate a basic test, checking whether the lambda under test finishes with the expected result.

```js
var tape = require('tape');
var context = require('@testlio/lambda-foundation').test.context;

tape.test('Example', function(t) {
    // we expect the context to succeed with the second parameter i.e. context.succeed({ test: 'result'}) or context.done(null, { test: 'result'}) is called
    var mockContext = context.assertSucceed(t, { test: 'result'});
    lambda.handler(event, mockContext);
});
```

You can also provide a callback with custom assertions:

```js
var tape = require('tape');
var context = require('@testlio/lambda-foundation').test.context;

tape.test('Example', function(t) {
    var mockContext = context.assertFail(t, function(err) {
        t.same(err, new Error('401', 'Unauthorized'));
    });
    lambda.handler(event, mockContext);
});
```

#### Event

Our event submodule provides a way to easily create either authorized or unauthorized events.

```js
var tape = require('tape');
var Event = require('@testlio/lambda-foundation').test.event;

tape.test('Example', function(t) {
    // Creates an event object with an invalid authorization token
    var event = Event().unauthorized();
    lambda.handler(event, context);
});

tape.test('Example', function(t) {
    // Creates an event object with a valid authorization token signed with 'default_secret'
    // and additional properties passed in the constructor
    var event = Event({extra: 'property'}).authorized();
    lambda.handler(event, context);
});

tape.test('Example', function(t) {
    // Creates an event object with a valid authorization token signed with a custom secret
    // passed as parameter
    var event = Event().authorized('secret');
    lambda.handler(event, context);
});

```

#### Lambda test

Lastly, we have the lambda-test submodule. This submodule wraps a [Tape](https://www.npmjs.com/package/tape) test group and provides you with a [Sinon](http://sinonjs.org/docs/#sandbox) sandbox for easy mocking. The submodule takes care of restoring any mocks after the test run.

```js
var test = require('@testlio/lambda-foundation').test.test;
var customModule = require('custom');

test.test('Example test group', function(sandbox, tape) {

    sandbox.stub(customModule, 'method', function(result) {
        //skip complicated logic
        return result;
    });

    tape.test('Example test' function(t) {
        lambda.handler(event, context);
    });
});
```

We also provide a basic authorization test - it creates an event with an invalid token and asserts that the lambda under test fails with the expected error (`new Error('401', 'Invalid token')` by default).   

```js
var test = require('@testlio/lambda-foundation').test.test;

test.test('Example test group', function(sandbox, tape) {
    tape.testAuthorization(lambda, error);
});
```


#### All together now

Thus, using our testing module, a basic lambda test would look like this:

```js
var lambdaTest = require('@testlio/lambda-foundation').test;
var context = lambdaTest.context;
var Event = lambdaTest.event;
var test = lambdaTest.test;

var Error = require('@testlio/lambda-foundation').error;
var lambda = require('path/to/lambda');

test.test('Example test group', function(sandbox, tape) {

    tape.testAuthorization(lambda);

    tape.test('Example successful context test' function(t){
        var mockContext = context.assertSucceed(t, {test: 'result'});
        lambda.handler(Event().authorized(), mockContext);
    });

    tape.test('Example failed context test' function(t){
        var mockContext = context.assertFail(t, new Error('400', 'Bad request')});
        lambda.handler(Event({parameter: 'invalid_value'}).authorized(), mockContext);
    });
});
```
