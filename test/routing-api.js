'use strict';

const assert = require('assert');
const nock = require('nock');
const RoutingApi = require('../lib/routing-api');
const VERSION = require('../package.json').version;

describe('RoutingApi', function() {

  describe('Constructor', function() {
    let defaults = {};
    before(function() {
      defaults = {
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
      };
    });

    it('create new instance', function() {
      const client = new RoutingApi();
      assert(client instanceof RoutingApi);
    });

    it('auto constructs', function() {
      // eslint-disable-next-line new-cap
      const client = RoutingApi();
      assert(client instanceof RoutingApi);
    });

    it('has default options', function() {
      const client = new RoutingApi();
      assert.deepEqual(
        Object.keys(defaults),
        Object.keys(client.options)
      );
    });

    it('accepts and overrides options', function() {
      const options = {
        base_url: 'http://127.0.0.1:8080',
        power: 'Max',
        request_options: {
          headers: {
            'User-Agent': 'test'
          }
        }
      };

      const client = new RoutingApi(options);

      assert(client.options.hasOwnProperty('power'));
      assert.equal(client.options.power, options.power);

      assert.equal(client.options.base_url, options.base_url);

      assert.equal(
        client.options.request_options.headers['User-Agent'],
        options.request_options.headers['User-Agent']
      );
    });

    it('has pre-configured request object', function(next) {
      const client = new RoutingApi({
        request_options: {
          headers: {
            foo: 'bar'
          }
        }
      });

      assert(client.hasOwnProperty('request'));

      nock('http://127.0.0.1:8080').get('/').reply(200);
      client.request.get('http://127.0.0.1:8080/', function(error, response) {

        const headers = response.request.headers;

        assert(headers.hasOwnProperty('foo'));
        assert(headers.foo, 'bar');

        assert.equal(headers['User-Agent'], 'routing-api/' + VERSION);

        next();
      });
    });
  });

  describe('Methods', function() {
    describe('__buildEndpoint()', function() {
      let client;

      before(function() {
        client = new RoutingApi();
      });

      it('method exists', function() {
        assert.equal(typeof client.__buildEndpoint, 'function');
      });

      it('build url', function() {
        const path = 'row-RoutingManager/routingRequest';

        assert.throws(
          client.__buildEndpoint,
          Error
        );

        assert.equal(
          client.__buildEndpoint(path),
          `${client.options.base_url}/${path}`
        );

        assert.equal(
          client.__buildEndpoint('/' + path),
          `${client.options.base_url}/${path}`
        );

        assert.equal(
          client.__buildEndpoint(path + '/'),
          `${client.options.base_url}/${path}/`
        );

        assert.equal(
          client.__buildEndpoint(path),
          'https://www.waze.com/row-RoutingManager/routingRequest'
        );
      });
    });

    describe('__request()', function(){
      before(function(){
        this.nock = nock('https://www.waze.com');
        this.client = new RoutingApi();
      });

      it('accepts any 2xx response', function(done) {
        var jsonResponse = {id: 1, name: 'routing'};
        this.nock.get(/.*/).reply(201, jsonResponse);
        this.client.__request('get', '/row-RoutingManager/routingRequest')
          .then(data => {
            assert.deepEqual(data, jsonResponse);
            done();
          });
      });

      it('errors when there is an error object', function(done){
        var jsonResponse = {errors: ['nope']};
        this.nock.get(/.*/).reply(203, jsonResponse);
        this.client.__request('get', '/row-RoutingManager/routingRequest')
          .catch(error => {
            assert.deepEqual(error, ['nope']);
            done();
          });
      });

      it('errors on bad json', function(done) {
        this.nock.get(/.*/).reply(200, 'fail whale');
        this.client.__request('get', '/row-RoutingManager/routingRequest')
          .catch(error => {
            assert(error instanceof Error);
            done();
          });
      });

      it('allows an empty response', function(done){
        this.nock.get(/.*/).reply(201, '');
        this.client.__request('get', '/row-RoutingManager/routingRequest')
          .then(data => {
            assert.deepEqual(data, {});
            done();
          });
      });

      it('errors when there is a bad http status code', function(done) {
        this.nock.get(/.*/).reply(500, '{}');
        this.client.__request('get', '/row-RoutingManager/routingRequest')
          .catch(error => {
            assert(error instanceof Error);
            done();
          });
      });

      it('errors on a request or network error', function(done) {
        this.nock.get(/.*/).replyWithError('something bad happened');
        this.client.__request('get', '/row-RoutingManager/routingRequest')
          .catch(error => {
            assert(error instanceof Error);
            done();
          });
      });
    });

    describe('get()', function() {
    });
  });
});
