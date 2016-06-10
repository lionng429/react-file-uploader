/* eslint-disable no-undef, max-len */
jest.dontMock('../UploadManager');
jest.dontMock('../index');
jest.dontMock('classnames');
jest.dontMock('lodash');

import React from 'react';
import ReactDOM from 'react-dom';
import { jsdom } from 'jsdom';
import nock from 'nock';

const FileUploader = require('../index');
const UploadManager = FileUploader.UploadManager;
const uploadStatus = FileUploader.status;

describe('UploadManager', () => {
  beforeEach(function setting() {
    global.document = jsdom();
    global.window = document.parentWindow;

    this.stringClass = 'receiver';
    this.arrayClass = ['react', 'receiver'];
    this.style = { display: 'block' };
    this.uploadPath = 'http://localhost:3000/api/upload';
    this.onUploadStart = jest.fn();
    this.onUploadProgress = jest.fn();
    this.onUploadEnd = jest.fn();

    this.children = <p>children</p>;
    this.container = document.createElement('div');
    this.instance = ReactDOM.render(
      <UploadManager
        uploadUrl={this.uploadPath}
        onUploadEnd={this.onUploadEnd}
      >
        {this.children}
      </UploadManager>,
      this.container
    );
  });

  afterEach(function setting() {
    this.container = null;
    this.instance = null;
  });

  describe('#render()', () => {
    it('should render ul element by default', function test() {
      const node = ReactDOM.findDOMNode(this.instance);
      expect(node).toEqual(jasmine.any(HTMLUListElement));
      expect(node.firstElementChild).toEqual(jasmine.any(HTMLParagraphElement));
    });

    it('should render wrapper element according to component props', function test() {
      this.instance = ReactDOM.render(
        <UploadManager
          component="div"
          uploadUrl={this.uploadPath}
          onUploadEnd={this.onUploadEnd}
        >
          {this.children}
        </UploadManager>,
        this.container
      );
      const node = ReactDOM.findDOMNode(this.instance);
      expect(node).toEqual(jasmine.any(HTMLDivElement));
    });

    it('should render a wrapper with customClass in string', function test() {
      this.instance = ReactDOM.render(
        <UploadManager
          component="div"
          customClass={this.stringClass}
          style={this.style}
          uploadUrl={this.uploadPath}
          onUploadEnd={this.onUploadEnd}
        >
          {this.children}
        </UploadManager>,
        this.container
      );
      const node = ReactDOM.findDOMNode(this.instance);
      expect(node.className).toEqual(this.stringClass);
    });

    it('should render a wrapper with customClass in array', function test() {
      this.instance = ReactDOM.render(
        <UploadManager
          component="div"
          customClass={this.arrayClass}
          style={this.style}
          uploadUrl={this.uploadPath}
          onUploadEnd={this.onUploadEnd}
        >
          {this.children}
        </UploadManager>,
        this.container
      );
      const node = ReactDOM.findDOMNode(this.instance);
      expect(node.className).toEqual(this.arrayClass.join(' '));
    });
  });

  describe('#uploadErrorHandler()', () => {
    beforeEach(function setting() {
      this.err = new Error('not found');
      this.errorResponse = { body: { success: false, errors: { message: 'not found' } } };
      this.successResponse = { body: { success: true } };
      this.errorHandler = this.instance.props.uploadErrorHandler;
    });

    it('should return an object contains key of `error` and `result`', function test() {
      const result = this.errorHandler(null, this.successResponse);
      expect(result.error).toBeNull();
      expect(result.result).toEqual(this.successResponse.body);
    });

    it('should return an object with key of `error` with value equals to the first argument if it is not empty', function test() {
      const result = this.errorHandler(this.err, this.successResponse);
      expect(result.error).toEqual(this.err.message);
      expect(result.result).toEqual(this.successResponse.body);
    });

    it('should return an object with key of `error` with value equals to the value of `body.error` of the second argument if it is not empty', function test() {
      const result = this.errorHandler(null, this.errorResponse);
      expect(result.error).toEqual(this.errorResponse.body.errors);
      delete this.errorResponse.body.errors;
      expect(result.result).toEqual(this.errorResponse.body);
    });
  });

  describe('#upload()', () => {
    beforeEach(function setting() {
      nock('http://localhost:3000')
        .filteringRequestBody(() => '*')
        .post('/api/upload', '*')
        .reply(200, this.successResponse);

      this.instance = ReactDOM.render(
        <UploadManager
          uploadUrl={this.uploadPath}
          onUploadStart={this.onUploadStart}
          onUploadProgress={this.onUploadProgress}
          onUploadEnd={this.onUploadEnd}
        >
          {this.children}
        </UploadManager>,
        this.container
      );
      this.errorResponse = { success: false, errors: { message: 'not found' } };
      this.successResponse = { success: true };
    });

    afterEach(() => {
      nock.cleanAll();
      nock.enableNetConnect();
    });

    it('should call onUploadStart prop functions if it is given', function test() {
      this.instance.upload(this.instance.props.uploadUrl, {});
      expect(this.onUploadStart).toBeCalledWith({ status: uploadStatus.UPLOADING });
    });
  });
});
