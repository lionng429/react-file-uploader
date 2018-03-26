/* eslint-disable no-undef, max-len, no-console */
jest.dontMock('../UploadHandler');
jest.dontMock('../index');
jest.dontMock('classnames');

import React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

const FileUploader = require('../index');
const uploadStatus = FileUploader.status;
const UploadHandler = FileUploader.UploadHandler;

configure({ adapter: new Adapter() });

describe('UploadHandler', () => {
  let uploadHandler,
    component,
    mockAbort,
    mockUpload,
    stringClass = 'receiver',
    arrayClass = ['react', 'receiver'],
    customStyle = { display: 'block' },
    children = (<span>children</span>),
    renderFunction = jest.genMockFn(),
    file = { id: 'fileId', status: uploadStatus.PENDING };

  beforeEach(() => {
    mockAbort = jest.genMockFn();
    mockUpload = jest.genMockFn();
    renderFunction.mockReturnValue(children);

    component = (
      <UploadHandler
        customClass={stringClass}
        style={customStyle}
        file={file}
        abort={mockAbort}
        upload={mockUpload}
      />
    );

    uploadHandler = shallow(component);
  });

  describe('componentDidMount()', () => {
    it('should throw an error if `props.upload` is not a function', () => {
      expect(() => shallow(
        <UploadHandler
          file={file}
          abort={mockAbort}
        />
      )).toThrow('`props.upload` must be a function');
    });

    it('should throw an error if `props.file` is missing', () => {
      expect(() => shallow(
        <UploadHandler
          abort={mockAbort}
          upload={mockUpload}
        />
      )).toThrow('`props.file` must be provided');
    });

    it('should call `props.upload()` if `props.autoStart` is true', () => {
      uploadHandler = shallow(
        <UploadHandler
          file={file}
          upload={mockUpload}
          autoStart
        />
      );

      expect(mockUpload).toBeCalledWith(file);
    });
  });

  describe('render()', () => {
    it('should render a HTML `props.component` element as wrapper', () => {
      expect(uploadHandler.type()).toEqual('li');
      uploadHandler.setProps({ component: 'div' });
      expect(uploadHandler.type()).toEqual('div');
      expect(uploadHandler.children().exists()).toBe(false);
    });

    it('should render ReactElement children if it is given', () => {
      uploadHandler.setProps({ children });
      expect(uploadHandler.children().matchesElement(children));
    });

    it('should accept children as render function with { abort, upload } and the instance itself', () => {
      uploadHandler.setProps({ children: renderFunction });
      expect(renderFunction).toBeCalledWith({ abort: mockAbort, upload: mockUpload }, uploadHandler.instance());
      expect(uploadHandler.children().matchesElement(children));
    });

    it('should render a div wrapper with customClass in string', () => {
      uploadHandler.setProps({ customClass: stringClass });
      expect(uploadHandler.hasClass(stringClass)).toBe(true);
    });

    it('should render a div wrapper with customClass in array', () => {
      uploadHandler.setProps({ customClass: arrayClass });
      arrayClass.forEach((classname) => {
        expect(uploadHandler.hasClass(classname)).toBe(true);
      });
    });

    it('should render a div wrapper with applying `props.style`', () => {
      uploadHandler.setProps({ style: customStyle });
      expect(uploadHandler.prop('style')).toEqual(customStyle);
    });
  });
});
/* eslint-enable no-undef, max-len, no-console */
