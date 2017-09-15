'use strict';
/* jshint expr: true */
const sinon = require("sinon");
const chai = require('chai');
const expect = chai.expect;
const mock = require('mock-require');

mock('winston', {
  error: function(err) {
  },
  info: function(err) {
  }
});

let segment = {};

mock('aws-xray-sdk-core', {
  getSegment: function() {
    return segment;
  }});

const annot8 = require('../src/index');

describe("Annot8", function () {

  this.timeout(10000);

  let testedObject = null;

  beforeEach(function () {

  });

  describe("adds anotation and metadata if data is available", function () {

    it("when req object contains almost empty apiGateway event", function () {
      process.env.xray = true;
      let req = {};
      req.apiGateway = {};
      req.apiGateway.event = {};
      req.apiGateway.event.httpMethod = "GET";
      req.apiGateway.event.headers = {};
      segment.addAnnotation = sinon.spy();
      segment.addMetadata = sinon.spy();

      annot8(req, null, null);
      expect(segment.addAnnotation.called).to.be.true;
    });

    it("when req object contains all fields all are reported", function () {
      process.env.xray = true;
      let req = {};
      req.apiGateway = {};
      req.apiGateway.event = {};
      req.apiGateway.event.path = "/v1/test";
      req.apiGateway.event.queryStringParameters = "";
      req.apiGateway.event.httpMethod = "GET";
      req.apiGateway.event.headers = {};
      req.apiGateway.event.headers.Host = "http://test";
      req.apiGateway.event.headers.Authorization = "token2f213887-d9ad-4dbc-a89d-d69cd6599fb5";
      req.apiGateway.event.headers["User-Agent"] = "Some browser";
      req.apiGateway.event.requestContext = {};
      req.apiGateway.event.requestContext.stage = "master";
      req.apiGateway.event.requestContext.identity = {};
      req.apiGateway.event.requestContext.identity.sourceIp = "123.123.123.123";
      req.apiGateway.event.requestContext.authorizer = {};
      req.apiGateway.event.requestContext.authorizer.principalId = "user@someid";
      segment.addAnnotation = sinon.spy();
      segment.addMetadata = sinon.spy();

      annot8(req, null, null);
      expect(segment.addAnnotation.called).to.be.true;

      expect(segment.addAnnotation.getCall(0).args[0]).to.be.equal("Method");
      expect(segment.addAnnotation.getCall(0).args[1]).to.be.equal("GET");

      expect(segment.addAnnotation.getCall(1).args[0]).to.be.equal("Url");
      expect(segment.addAnnotation.getCall(1).args[1]).to.be.equal("http://test/master/v1/test");

      expect(segment.addAnnotation.getCall(2).args[0]).to.be.equal("ClientIp");
      expect(segment.addAnnotation.getCall(2).args[1]).to.be.equal("123.123.123.123");

      expect(segment.addAnnotation.getCall(3).args[0]).to.be.equal("UserAgent");
      expect(segment.addAnnotation.getCall(3).args[1]).to.be.equal("Some browser");

      expect(segment.addAnnotation.getCall(4).args[0]).to.be.equal("PrincipalId");
      expect(segment.addAnnotation.getCall(4).args[1]).to.be.equal("user@someid");

      expect(segment.addAnnotation.getCall(5).args[0]).to.be.equal("Authorization");
      expect(segment.addAnnotation.getCall(5).args[1]).to.be.equal("token2f213887-d9ad-4dbc-a89d-d69cd6599fb5");

      expect(segment.addAnnotation.getCall(6).args[0]).to.be.equal("Stage");
      expect(segment.addAnnotation.getCall(6).args[1]).to.be.equal("master");

    });

  });

  describe("passes gracefully", function () {

    it("when the data is not there", function () {
      process.env.xray = true;
      let req = {};
      segment.addAnnotation = sinon.spy();
      segment.addMetadata = sinon.spy();
      let next = sinon.spy();
      annot8(req, null, next);
      expect(segment.addAnnotation.called).to.be.false;
      expect(next.calledOnce).to.be.true;
    });

  });

});