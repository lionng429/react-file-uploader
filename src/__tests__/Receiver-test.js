/* eslint-disable no-undef, max-len */
jest.dontMock('../Receiver');
jest.dontMock('../index');
jest.dontMock('classnames');

import React from 'react';
import ReactDOM from 'react-dom';
import { jsdom } from 'jsdom';

const FileUploader = require('../index');
const { PENDING } = FileUploader.status;
const Receiver = FileUploader.Receiver;

const createComponent = (onDragEnter, onDragOver, onDragLeave, onFileDrop) => (
  <Receiver
    onDragEnter={onDragEnter}
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    onFileDrop={onFileDrop}
  />
);

// eslint-disable-next-line react/prefer-es6-class
const createTemplate = (initialState, props, Component) => React.createClass({
  getInitialState() { return initialState; },
  render() {
    return (
      <Component.type
        ref="receiver"
        isOpen={this.state.isOpen}
        files={this.state.files}
        {...props}
        {...Component.props}
      >
        <h1>Test</h1>
      </Component.type>
    );
  },
});

describe('Receiver', () => {
  beforeEach(function setting() {
    global.document = jsdom();
    global.window = document.parentWindow;

    const testFile = {
      lastModified: 1465229147840,
      lastModifiedDate: 'Tue Jun 07 2016 00:05:47 GMT+0800 (HKT)',
      name: 'test.jpg',
      size: 1024,
      type: 'image/jpg',
      webkitRelativePath: '',
    };
    const files = [testFile];

    const mockDT = {
      files,
      setData: jest.genMockFunction(),
    };

    this.stringClass = 'receiver';
    this.arrayClass = ['react', 'receiver'];

    this.dragEnterEvent = document.createEvent('HTMLEvents');
    this.dragEnterEvent.initEvent('dragenter', false, true);

    this.dragOverEvent = document.createEvent('HTMLEvents');
    this.dragOverEvent.initEvent('dragover', false, true);
    this.dragOverEvent.preventDefault = jest.genMockFn();

    this.dragLeaveEvent = document.createEvent('HTMLEvents');
    this.dragLeaveEvent.initEvent('dragleave', false, true);

    this.dropEvent = document.createEvent('HTMLEvents');
    this.dropEvent.initEvent('drop', false, true);
    this.dropEvent.preventDefault = jest.genMockFn();
    this.dropEvent.dataTransfer = mockDT;
  });

  describe('state of dragLevel', () => {
    beforeEach(function setting() {
      const onDragEnter = jest.genMockFn();
      const onDragOver = jest.genMockFn();
      const onDragLeave = jest.genMockFn();
      const onFileDrop = jest.genMockFn();

      this.onDragEnter = onDragEnter;
      this.onDragOver = onDragOver;
      this.onDragLeave = onDragLeave;
      this.onFileDrop = onFileDrop;

      const Component = createComponent(onDragEnter, onDragOver, onDragLeave, onFileDrop);
      const template = createTemplate({ isOpen: false, files: [] }, {}, Component);

      this.createTestParent = React.createFactory(template);
      this.ParentComponent = this.createTestParent();
      this.container = document.createElement('div');
      this.instance = ReactDOM.render(this.ParentComponent, this.container);
      this.receiver = this.instance.refs.receiver;
    });

    it('should increase state of dragLevel by 1 with dragEnter event', function test() {
      const oldDragLevel = this.receiver.state.dragLevel;
      window.dispatchEvent(this.dragEnterEvent);
      const newDragLevel = this.receiver.state.dragLevel;
      expect(newDragLevel).toEqual(oldDragLevel + 1);
    });

    it('should call onDragEnter with dragEnter event if isOpen is false', function test() {
      window.dispatchEvent(this.dragEnterEvent);
      expect(this.onDragEnter).toBeCalled();
    });

    it('should not call onDragEnter with dragEnter event if isOpen is true', function test() {
      this.instance.setState({ isOpen: true });
      window.dispatchEvent(this.dragEnterEvent);
      expect(this.onDragEnter).not.toBeCalled();
    });

    it('should call event.preventDefault with dragOver event', function test() {
      window.dispatchEvent(this.dragOverEvent);
      expect(this.dragOverEvent.preventDefault).toBeCalled();
    });

    it('should call onDragOver with dragOver event', function test() {
      window.dispatchEvent(this.dragOverEvent);
      expect(this.onDragOver).toBeCalled();
    });

    it('should decrease state of dragLevel by 1 with dragLeave event', function test() {
      const oldDragLevel = this.receiver.state.dragLevel;
      window.dispatchEvent(this.dragEnterEvent);
      const newDragLevel = this.receiver.state.dragLevel;
      expect(newDragLevel).toEqual(oldDragLevel + 1);

      window.dispatchEvent(this.dragLeaveEvent);
      const finalDragLevel = this.receiver.state.dragLevel;
      expect(finalDragLevel).toEqual(newDragLevel - 1);
      expect(this.onDragLeave).toBeCalled();
    });

    it('should call onDragLeave if state of dragLevel is not 0', function test() {
      const oldDragLevel = this.receiver.state.dragLevel;
      window.dispatchEvent(this.dragEnterEvent);
      const newDragLevel = this.receiver.state.dragLevel;
      expect(newDragLevel).toEqual(oldDragLevel + 1);

      window.dispatchEvent(this.dragEnterEvent);
      const newerDragLevel = this.receiver.state.dragLevel;
      expect(newerDragLevel).toEqual(newDragLevel + 1);

      window.dispatchEvent(this.dragLeaveEvent);
      const finalDragLevel = this.receiver.state.dragLevel;
      expect(finalDragLevel).toEqual(newerDragLevel - 1);
      expect(this.onDragLeave).not.toBeCalled();

      window.dispatchEvent(this.dragLeaveEvent);
      const endDragLevel = this.receiver.state.dragLevel;
      expect(endDragLevel).toEqual(finalDragLevel - 1);
      expect(this.onDragLeave).toBeCalled();
    });

    it('should call event.preventDefault with drop event', function test() {
      window.dispatchEvent(this.dropEvent);
      // eslint-disable-next-line no-undef
      expect(this.dropEvent.preventDefault).toBeCalled();
    });

    it('should call onFileDrop with drop event', function test() {
      window.dispatchEvent(this.dropEvent);
      expect(this.onFileDrop).toBeCalled();
    });

    it('should set state of dragLevel to 0 with dragEnter event', function test() {
      const oldDragLevel = this.receiver.state.dragLevel;
      window.dispatchEvent(this.dragEnterEvent);
      const newDragLevel = this.receiver.state.dragLevel;
      expect(newDragLevel).toEqual(oldDragLevel + 1);

      window.dispatchEvent(this.dropEvent);
      const finalDragLevel = this.receiver.state.dragLevel;
      expect(finalDragLevel).toEqual(0);
    });

    it('should not call any callback after Receiver did unmount', function test() {
      ReactDOM.unmountComponentAtNode(this.container);
      window.dispatchEvent(this.dragEnterEvent);
      expect(this.onDragEnter).not.toBeCalled();

      window.dispatchEvent(this.dragOverEvent);
      expect(this.onDragOver).not.toBeCalled();

      window.dispatchEvent(this.dragLeaveEvent);
      expect(this.onDragLeave).not.toBeCalled();

      window.dispatchEvent(this.dropEvent);
      expect(this.onFileDrop).not.toBeCalled();
    });
  });

  describe('callbacks and callback arguments', () => {
    beforeEach(function setting() {
      const onDragEnter = (e) => {
        expect(e.type).toBe('dragenter');
      };
      const onDragOver = (e) => {
        expect(e.type).toBe('dragover');
      };
      const onDragLeave = (e) => {
        expect(e.type).toBe('dragleave');
      };
      const onFileDrop = (e, _files) => {
        expect(e.type).toBe('drop');
        const file = _files[0];
        expect(file.lastModified).toBe(testFile.lastModified);
        expect(file.lastModifiedDate).toBe(testFile.lastModifiedDate);
        expect(file.name).toBe(testFile.name);
        expect(file.size).toBe(testFile.size);
        expect(file.type).toBe(testFile.type);
        expect(file.webkitRelativePath).toBe(testFile.webkitRelativePath);
        expect(file.status).toBe(PENDING);
        expect(file.progress).toBe(0);
        expect(file.src).toBe(null);
      };

      this.onDragEnter = onDragEnter;
      this.onDragOver = onDragOver;
      this.onDragLeave = onDragLeave;
      this.onFileDrop = onFileDrop;

      const Component = createComponent(onDragEnter, onDragOver, onDragLeave, onFileDrop);
      const template = createTemplate({ isOpen: false, files: [] }, {}, Component);

      this.createTestParent = React.createFactory(template);
      this.ParentComponent = this.createTestParent();
      this.container = document.createElement('div');
      this.instance = ReactDOM.render(this.ParentComponent, this.container);
      this.receiver = this.instance.refs.receiver;
    });

    it('should execute the onDragEnter callback with a DragEvent with type `dragenter` as argument', function test() {
      window.dispatchEvent(this.dragEnterEvent);
    });

    it('should execute the onDragOver callback with a DragEvent with type `dragover` as argument', function test() {
      window.dispatchEvent(this.dragOverEvent);
    });

    it('should execute the onDragLeave callback with a DragEvent with type `dragleave` as argument', function test() {
      window.dispatchEvent(this.dragLeaveEvent);
    });

    it('should execute the onFileDrop callback with a DragEvent with type `drop` as argument', function test() {
      window.dispatchEvent(this.dropEvent);
    });
  });

  describe('#render', () => {
    beforeEach(function setting() {
      const Component = createComponent();
      const template = createTemplate({ isOpen: false, files: [] }, {}, Component);

      this.createTestParent = React.createFactory(template);
      this.ParentComponent = this.createTestParent();
      this.container = document.createElement('div');
      this.instance = ReactDOM.render(this.ParentComponent, this.container);
      this.receiver = this.instance.refs.receiver;
    });

    it('should render nothing if isOpen is false', function test() {
      const receiver = ReactDOM.findDOMNode(this.receiver);
      expect(receiver).toBeNull();
      this.instance.setState({ isOpen: true });
    });

    it('should render a div wrapper with children if isOpen is true', function test() {
      this.instance.setState({ isOpen: true });
      const receiver = ReactDOM.findDOMNode(this.receiver);
      expect(receiver).toEqual(jasmine.any(HTMLDivElement));
      expect(receiver.firstElementChild).toEqual(jasmine.any(HTMLHeadingElement));
    });

    it('should render a div wrapper with customClass in string', function test() {
      const Component = createComponent();
      const template = createTemplate({ isOpen: true, files: [] }, { customClass: this.stringClass }, Component);

      this.createTestParent = React.createFactory(template);
      this.ParentComponent = this.createTestParent();
      this.container = document.createElement('div');
      this.instance = ReactDOM.render(this.ParentComponent, this.container);
      this.receiver = this.instance.refs.receiver;

      const receiver = ReactDOM.findDOMNode(this.receiver);
      expect(receiver.className).toEqual(this.stringClass);
    });

    it('should render a div wrapper with customClass in array', function test() {
      const Component = createComponent();
      const template = createTemplate({ isOpen: true, files: [] }, { customClass: this.arrayClass }, Component);

      this.createTestParent = React.createFactory(template);
      this.ParentComponent = this.createTestParent();
      this.container = document.createElement('div');
      this.instance = ReactDOM.render(this.ParentComponent, this.container);
      this.receiver = this.instance.refs.receiver;

      const receiver = ReactDOM.findDOMNode(this.receiver);
      expect(receiver.className).toEqual(this.arrayClass.join(' '));
    });
  });
});
/* eslint-enable no-undef */
