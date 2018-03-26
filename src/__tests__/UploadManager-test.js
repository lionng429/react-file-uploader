/* eslint-disable no-undef, max-len */
jest.dontMock('../UploadManager');
jest.dontMock('../index');
jest.dontMock('classnames');
jest.dontMock('lodash');

import React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { jsdom } from 'jsdom';
import nock from 'nock';

const FileUploader = require('../index');
const UploadManager = FileUploader.UploadManager;
const uploadStatus = FileUploader.status;

configure({ adapter: new Adapter() });

describe('UploadManager', () => {
  let stringClass = 'receiver',
    arrayClass = ['react', 'receiver'],
    uploadPath = 'http://localhost:3000/api/upload',
    children = (<p>children</p>),
    uploadManager,
    onUploadStart,
    onUploadProgress,
    onUploadEnd,
    formDataParser,
    err,
    errorResponse,
    successResponse,
    errorHandler;

  beforeEach(() => {
    global.document = jsdom();
    global.window = document.parentWindow;

    onUploadStart = jest.genMockFn();
    onUploadProgress = jest.genMockFn();
    onUploadEnd = jest.genMockFn();
    formDataParser = jest.genMockFn();

    err = new Error('not found');
    errorResponse = { body: { success: false, errors: { message: 'not found' } } };
    successResponse = { body: { success: true } };
    errorHandler = UploadManager.defaultProps.uploadErrorHandler;

    uploadManager = shallow(
      <UploadManager
        customClass={stringClass}
        uploadUrl={uploadPath}
        onUploadStart={onUploadStart}
        onUploadProgress={onUploadProgress}
        onUploadEnd={onUploadEnd}
        formDataParser={formDataParser}
      >
        {children}
      </UploadManager>
    )
  });

  afterEach(() => {
    uploadManager = null;
  });

  describe('render()', () => {
    it('should render ul element by default', () => {
      expect(uploadManager.type()).toEqual('ul');
      expect(uploadManager.childAt(0).type()).toEqual('p');
    });

    it('should render wrapper element according to component props', () => {
      uploadManager.setProps({ component: 'div' });
      expect(uploadManager.type()).toEqual('div');
    });

    it('should render a wrapper with customClass in string', () => {
      expect(uploadManager.hasClass(stringClass)).toBe(true);
    });

    it('should render a wrapper with customClass in array', () => {
      uploadManager.setProps({ customClass: arrayClass });

      arrayClass.forEach((classname) => {
        expect(uploadManager.hasClass(classname)).toBe(true);
      });
    });
  });

  describe('uploadErrorHandler()', () => {
    it('should return an object contains key of `error` and `result`', () => {
      const result = errorHandler(null, successResponse);
      expect(result.error).toBeNull();
      expect(result.result).toEqual(successResponse.body);
    });

    it('should return an object with key of `error` with value equals to the first argument if it is not empty', () => {
      const result = errorHandler(err, successResponse);
      expect(result.error).toEqual(err.message);
      expect(result.result).toEqual(successResponse.body);
    });

    it('should return an object with key of `error` with value equals to the value of `body.error` of the second argument if it is not empty', () => {
      const result = errorHandler(null, errorResponse);
      expect(result.error).toEqual(errorResponse.body.errors);
      delete errorResponse.body.errors;
      expect(result.result).toEqual(errorResponse.body);
    });
  });

  describe('upload()', () => {
    let file;

    beforeEach(() => {
      file = {};

      nock('http://localhost:3000')
        .filteringRequestBody(() => '*')
        .post('/api/upload', '*')
        .reply(200, successResponse);
    });

    afterEach(() => {
      nock.cleanAll();
      nock.enableNetConnect();
    });

    it('should call `props.onUploadStart` function if it is given', () => {
      const instance = uploadManager.instance();
      instance.upload(instance.props.uploadUrl, file);
      expect(onUploadStart).toBeCalledWith(Object.assign({}, file, { status: uploadStatus.UPLOADING }));
      expect(file).toEqual({ status: uploadStatus.UPLOADING });
    });

    it('should call `props.formDataParser` function if it is given', () => {
      const instance = uploadManager.instance();
      instance.upload(instance.props.uploadUrl, {});
      expect(formDataParser).toBeCalledWith(new FormData(), { status: uploadStatus.UPLOADING });
    });
  });
});
/* eslint-enable no-undef, max-len */
