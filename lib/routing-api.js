'use strict';

/**
 * Module dependencies
 */

const request = require('request');
const extend = require('deep-extend');

// Package version
const VERSION = require('../package.json').version;

function RoutingApi(options) {
  if (!(this instanceof RoutingApi)) {
    return new RoutingApi(options);
  }

  this.VERSION = VERSION;

  // Merge the default options with the client submitted options
  this.options = extend({
    base_url: 'https://www.waze.com',
    request_options: {
      headers: {
        Accept: '*/*',
        Connection: 'close',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        Referer: 'https://www.waze.com',
        'User-Agent': 'routing-api/' + VERSION
      }
    }
  }, options);

  // Configure default request options
  this.request = request.defaults(this.options.request_options);
}

RoutingApi.prototype.__buildEndpoint = function(path) {
  return this.options.base_url + ('/' === path.charAt(0) ? path : '/' + path);
};

RoutingApi.prototype.__request = function(method, path, params) {

  // Build the options to pass to our custom request object
  const options = {
    method: method.toLowerCase(),  // Request method - get || post
    url: this.__buildEndpoint(path) // Generate url
  };

  // Pass url parameters if get
  if ('get' === method) {
    options.qs = params;
  } else {
    options.body = JSON.stringify(params);
  }

  var _this = this;
  return new Promise(function(resolve, reject) {
    _this.request(options, function(error, response, data) {
      // request error
      if (error) {
        return reject(error);
      }

      // JSON parse error or empty strings
      try {
        // An empty string is a valid response
        data = '' === data ? {} : JSON.parse(data);
      } catch(parseError) {
        return reject(new Error('JSON parseError with HTTP Status: ' + response.statusCode + ' ' + response.statusMessage));
      }

      // response object errors
      // This should return an error object not an array of errors
      if (data.errors !== undefined) {
        return reject(data.errors);
      }

      // status code errors
      if(response.statusCode < 200 || response.statusCode > 299) {
        return reject(new Error('HTTP Error: ' + response.statusCode + ' ' + response.statusMessage));
      }

      // no errors
      resolve(data);
    });
  });
};

/**
 * GET
 */
RoutingApi.prototype.get = function(url, params) {
  return this.__request('get', url, params);
};

/**
 * Get routing paths.
 *
 * @param {string} from - departure coordinates.
 * @param {string} to - destination coordinates.
 * @param {object} params - extra request params.
 */
RoutingApi.prototype.routing = function(from, to, params) {
  return this.get('row-RoutingManager/routingRequest', extend({
    from,
    to,
    at: '0',
    returnJSON: 'true',
    returnGeometries: 'true',
    returnInstructions: 'true',
    timeout: '60000',
    nPaths: '3',
    options: 'AVOID_TRAILS:t'
  }, params));
};

/**
 * search coordinates.
 *
 * @param {string} query - adress query.
 * @param {object} params - extra request params.
 */
RoutingApi.prototype.searchCoordinates = function(query, params) {
  return this.get('SearchServer/mozi', extend({
    q: query,
    lang: 'fr',
    lon: '2.352222',
    lat: '48.856614',
    origin: 'livemap'
  }, params));
};

module.exports = RoutingApi;
