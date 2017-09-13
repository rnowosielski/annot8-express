'use strict';
/* jshint expr: true */
const sinon = require("sinon");
const chai = require('chai');
const expect = chai.expect;
const mock = require('mock-require');

mock('winston', {
  err: function(err) {
  }});

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

  });

  describe("passes gracefully", function () {

    it("when the data is not there", function () {
      process.env.xray = true;
      let req = {};
      segment.addAnnotation = sinon.spy();
      segment.addMetadata = sinon.spy();
      annot8(req, null, null);
      expect(segment.addAnnotation.called).to.be.false;
    });

  });

});