# Lambda Foundation

Lambda foundation contains various shared parts that [AWS Lambda](https://aws.amazon.com/lambda/) backed microservices need and use. In its current state this package aims to simplify authentication, error reporting, service discovery (including URL resolving) and configuration.

## Installation and Usage

```
npm install @testlio/lambda-foundation
```

Then in code, you can import the entire foundation by:

```
var foundation = require('@testlio/lambda-foundation');
```

Notice that this package aims to be modular, allowing you direct access to the parts that are more important, for example to only get authentication, you can do either of the following:

```
var auth = require('@testlio/lambda-foundation/authentication');
var auth = require('@testlio/lambda-foundation').authentication;
```

## Parts

### Authentication

TBD

### Service Discovery

TBD

### Configuration

TBD

### Error Reporting

TBD
