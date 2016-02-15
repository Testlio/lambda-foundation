# Lambda Foundation

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
    let authPromise = Auth.authenticate(event);

    authPromise.then(function(jwt) {
        console.log('Hi, ' + jwt.sub);
        ...
    });
}
```

The authentication submodule also includes constants for scopes and allows both authentication against a specific scope as well as offering a utility function for manually checking if a specific JWT has specific scope(s).

```js
var Auth = require('@testlio/lambda-foundation').authentication;

function handler(event, context) {
    // We can provide a set of scopes and a rule that the event has to satisfy
    // the rule defaults to "All", but can also be "Any" or "None"
    let authPromise = Auth.authenticate(event, {
        scopes: [Auth.SCOPE.CLIENT, Auth.SCOPE.ADMIN],
        rule: Auth.RULE.ANY
    });

    authPromise.then(function(jwt) {
        // We now know that the user is either a client or an admin
        console.log('Hi, ' + jwt.sub);

        // We can check which exactly was satisfied
        if (auth.verifyScopes(jwt, { scopes: [Auth.SCOPE.ADMIN] })) {
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
            return reject(new Error.error('400', 'Missing variable'));
        }

        // Everything is fine and work can continue
        ...
    }).catch(function(err) {
        return Error.report(err).then(context.fail);
    }).then(context.done);
}
```
