'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _jsdom = require('jsdom');

var _nock = require('nock');

var _nock2 = _interopRequireDefault(_nock);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-undef, max-len */
jest.dontMock('../UploadManager');
jest.dontMock('../index');
jest.dontMock('classnames');
jest.dontMock('lodash');

var FileUploader = require('../index');
var UploadManager = FileUploader.UploadManager;
var uploadStatus = FileUploader.status;

describe('UploadManager', function () {
  beforeEach(function setting() {
    global.document = (0, _jsdom.jsdom)();
    global.window = document.parentWindow;

    this.stringClass = 'receiver';
    this.arrayClass = ['react', 'receiver'];
    this.style = { display: 'block' };
    this.uploadPath = 'http://localhost:3000/api/upload';
    this.onUploadStart = jest.fn();
    this.onUploadProgress = jest.fn();
    this.onUploadEnd = jest.fn();

    this.children = _react2.default.createElement(
      'p',
      null,
      'children'
    );
    this.container = document.createElement('div');
    this.instance = _reactDom2.default.render(_react2.default.createElement(
      UploadManager,
      {
        uploadUrl: this.uploadPath,
        onUploadEnd: this.onUploadEnd
      },
      this.children
    ), this.container);
  });

  afterEach(function setting() {
    this.container = null;
    this.instance = null;
  });

  describe('#render()', function () {
    it('should render ul element by default', function test() {
      var node = _reactDom2.default.findDOMNode(this.instance);
      expect(node).toEqual(jasmine.any(HTMLUListElement));
      expect(node.firstElementChild).toEqual(jasmine.any(HTMLParagraphElement));
    });

    it('should render wrapper element according to component props', function test() {
      this.instance = _reactDom2.default.render(_react2.default.createElement(
        UploadManager,
        {
          component: 'div',
          uploadUrl: this.uploadPath,
          onUploadEnd: this.onUploadEnd
        },
        this.children
      ), this.container);
      var node = _reactDom2.default.findDOMNode(this.instance);
      expect(node).toEqual(jasmine.any(HTMLDivElement));
    });

    it('should render a wrapper with customClass in string', function test() {
      this.instance = _reactDom2.default.render(_react2.default.createElement(
        UploadManager,
        {
          component: 'div',
          customClass: this.stringClass,
          style: this.style,
          uploadUrl: this.uploadPath,
          onUploadEnd: this.onUploadEnd
        },
        this.children
      ), this.container);
      var node = _reactDom2.default.findDOMNode(this.instance);
      expect(node.className).toEqual(this.stringClass);
    });

    it('should render a wrapper with customClass in array', function test() {
      this.instance = _reactDom2.default.render(_react2.default.createElement(
        UploadManager,
        {
          component: 'div',
          customClass: this.arrayClass,
          style: this.style,
          uploadUrl: this.uploadPath,
          onUploadEnd: this.onUploadEnd
        },
        this.children
      ), this.container);
      var node = _reactDom2.default.findDOMNode(this.instance);
      expect(node.className).toEqual(this.arrayClass.join(' '));
    });
  });

  describe('#uploadErrorHandler()', function () {
    beforeEach(function setting() {
      this.err = new Error('not found');
      this.errorResponse = { body: { success: false, errors: { message: 'not found' } } };
      this.successResponse = { body: { success: true } };
      this.errorHandler = this.instance.props.uploadErrorHandler;
    });

    it('should return an object contains key of `error` and `result`', function test() {
      var result = this.errorHandler(null, this.successResponse);
      expect(result.error).toBeNull();
      expect(result.result).toEqual(this.successResponse.body);
    });

    it('should return an object with key of `error` with value equals to the first argument if it is not empty', function test() {
      var result = this.errorHandler(this.err, this.successResponse);
      expect(result.error).toEqual(this.err.message);
      expect(result.result).toEqual(this.successResponse.body);
    });

    it('should return an object with key of `error` with value equals to the value of `body.error` of the second argument if it is not empty', function test() {
      var result = this.errorHandler(null, this.errorResponse);
      expect(result.error).toEqual(this.errorResponse.body.errors);
      delete this.errorResponse.body.errors;
      expect(result.result).toEqual(this.errorResponse.body);
    });
  });

  describe('#upload()', function () {
    beforeEach(function setting() {
      (0, _nock2.default)('http://localhost:3000').filteringRequestBody(function () {
        return '*';
      }).post('/api/upload', '*').reply(200, this.successResponse);

      this.instance = _reactDom2.default.render(_react2.default.createElement(
        UploadManager,
        {
          uploadUrl: this.uploadPath,
          onUploadStart: this.onUploadStart,
          onUploadProgress: this.onUploadProgress,
          onUploadEnd: this.onUploadEnd
        },
        this.children
      ), this.container);
      this.errorResponse = { success: false, errors: { message: 'not found' } };
      this.successResponse = { success: true };
    });

    afterEach(function () {
      _nock2.default.cleanAll();
      _nock2.default.enableNetConnect();
    });

    it('should call onUploadStart prop functions if it is given', function test() {
      this.instance.upload(this.instance.props.uploadUrl, {});
      expect(this.onUploadStart).toBeCalledWith({ status: uploadStatus.UPLOADING });
    });
  });
});