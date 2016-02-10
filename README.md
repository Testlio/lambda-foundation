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
        scopes: [Auth.Scope.Client, Auth.Scope.Admin],
        rule: Auth.Scope.Rule.Any
    });

    authPromise.then(function(jwt) {
        // We now know that the user is either a client or an admin
        console.log('Hi, ' + jwt.sub);

        // We can check which exactly was satisfied
        if (auth.hasScope(jwt, Auth.Scope.Admin)) {
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

### Service Discovery

TBD

### Configuration

TBD

### Error Reporting

TBD
