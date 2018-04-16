# Routing API 2.0.0

```javascript
const RoutingApi = require('routing-api');

const client = new RoutingApi();

client.routing('x:2.352222 y:48.856614', 'x:-0.5791800 y:44.837789')
  .then(console.log)
  .catch(console.error);;
```

## Installation

`npm install routing-api`

## Requests

### With endpoints

You now have the ability to make GET requests against the API via the convenience methods.

```javascript
client.get(path, params);
```

You can use the defined client methods to call endpoints.

### With client methods

```javascript
client.routing('x:2.352222 y:48.856614', 'x:-0.5791800 y:44.837789');
```

## Promises

The request will return Promise.

```javascript
client.routing('x:2.352222 y:48.856614', 'x:-0.5791800 y:44.837789')
  .then(function (data) {
    console.log(data);
  })
  .catch(function (e) {
    throw e;
  });
```
