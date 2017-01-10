'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _jsdom = require('jsdom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-undef, max-len */
jest.dontMock('../Receiver');
jest.dontMock('../index');
jest.dontMock('classnames');

var FileUploader = require('../index');
var PENDING = FileUploader.status.PENDING;

var Receiver = FileUploader.Receiver;

var createComponent = function createComponent(onDragEnter, onDragOver, onDragLeave, onFileDrop) {
  return _react2.default.createElement(Receiver, {
    onDragEnter: onDragEnter,
    onDragOver: onDragOver,
    onDragLeave: onDragLeave,
    onFileDrop: onFileDrop
  });
};

// eslint-disable-next-line react/prefer-es6-class
var createTemplate = function createTemplate(initialState, props, Component) {
  return _react2.default.createClass({
    getInitialState: function getInitialState() {
      return initialState;
    },
    render: function render() {
      return _react2.default.createElement(
        Component.type,
        _extends({
          ref: 'receiver',
          isOpen: this.state.isOpen,
          files: this.state.files
        }, props, Component.props),
        _react2.default.createElement(
          'h1',
          null,
          'Test'
        )
      );
    }
  });
};

describe('Receiver', function () {
  beforeEach(function setting() {
    global.document = (0, _jsdom.jsdom)();
    global.window = document.parentWindow;

    var testFile = {
      lastModified: 1465229147840,
      lastModifiedDate: 'Tue Jun 07 2016 00:05:47 GMT+0800 (HKT)',
      name: 'test.jpg',
      size: 1024,
      type: 'image/jpg',
      webkitRelativePath: ''
    };
    var files = [testFile];

    var mockDT = {
      files: files,
      setData: jest.genMockFunction()
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

  describe('state of dragLevel', function () {
    beforeEach(function setting() {
      var onDragEnter = jest.genMockFn();
      var onDragOver = jest.genMockFn();
      var onDragLeave = jest.genMockFn();
      var onFileDrop = jest.genMockFn();

      this.onDragEnter = onDragEnter;
      this.onDragOver = onDragOver;
      this.onDragLeave = onDragLeave;
      this.onFileDrop = onFileDrop;

      var Component = createComponent(onDragEnter, onDragOver, onDragLeave, onFileDrop);
      var template = createTemplate({ isOpen: false, files: [] }, {}, Component);

      this.createTestParent = _react2.default.createFactory(template);
      this.ParentComponent = this.createTestParent();
      this.container = document.createElement('div');
      this.instance = _reactDom2.default.render(this.ParentComponent, this.container);
      this.receiver = this.instance.refs.receiver;
    });

    it('should increase state of dragLevel by 1 with dragEnter event', function test() {
      var oldDragLevel = this.receiver.state.dragLevel;
      window.dispatchEvent(this.dragEnterEvent);
      var newDragLevel = this.receiver.state.dragLevel;
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
      var oldDragLevel = this.receiver.state.dragLevel;
      window.dispatchEvent(this.dragEnterEvent);
      var newDragLevel = this.receiver.state.dragLevel;
      expect(newDragLevel).toEqual(oldDragLevel + 1);

      window.dispatchEvent(this.dragLeaveEvent);
      var finalDragLevel = this.receiver.state.dragLevel;
      expect(finalDragLevel).toEqual(newDragLevel - 1);
      expect(this.onDragLeave).toBeCalled();
    });

    it('should call onDragLeave if state of dragLevel is not 0', function test() {
      var oldDragLevel = this.receiver.state.dragLevel;
      window.dispatchEvent(this.dragEnterEvent);
      var newDragLevel = this.receiver.state.dragLevel;
      expect(newDragLevel).toEqual(oldDragLevel + 1);

      window.dispatchEvent(this.dragEnterEvent);
      var newerDragLevel = this.receiver.state.dragLevel;
      expect(newerDragLevel).toEqual(newDragLevel + 1);

      window.dispatchEvent(this.dragLeaveEvent);
      var finalDragLevel = this.receiver.state.dragLevel;
      expect(finalDragLevel).toEqual(newerDragLevel - 1);
      expect(this.onDragLeave).not.toBeCalled();

      window.dispatchEvent(this.dragLeaveEvent);
      var endDragLevel = this.receiver.state.dragLevel;
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
      var oldDragLevel = this.receiver.state.dragLevel;
      window.dispatchEvent(this.dragEnterEvent);
      var newDragLevel = this.receiver.state.dragLevel;
      expect(newDragLevel).toEqual(oldDragLevel + 1);

      window.dispatchEvent(this.dropEvent);
      var finalDragLevel = this.receiver.state.dragLevel;
      expect(finalDragLevel).toEqual(0);
    });

    it('should not call any callback after Receiver did unmount', function test() {
      _reactDom2.default.unmountComponentAtNode(this.container);
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

  describe('callbacks and callback arguments', function () {
    beforeEach(function setting() {
      var onDragEnter = function onDragEnter(e) {
        expect(e.type).toBe('dragenter');
      };
      var onDragOver = function onDragOver(e) {
        expect(e.type).toBe('dragover');
      };
      var onDragLeave = function onDragLeave(e) {
        expect(e.type).toBe('dragleave');
      };
      var onFileDrop = function onFileDrop(e, _files) {
        expect(e.type).toBe('drop');
        var file = _files[0];
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

      var Component = createComponent(onDragEnter, onDragOver, onDragLeave, onFileDrop);
      var template = createTemplate({ isOpen: false, files: [] }, {}, Component);

      this.createTestParent = _react2.default.createFactory(template);
      this.ParentComponent = this.createTestParent();
      this.container = document.createElement('div');
      this.instance = _reactDom2.default.render(this.ParentComponent, this.container);
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

  describe('#render', function () {
    beforeEach(function setting() {
      var Component = createComponent();
      var template = createTemplate({ isOpen: false, files: [] }, {}, Component);

      this.createTestParent = _react2.default.createFactory(template);
      this.ParentComponent = this.createTestParent();
      this.container = document.createElement('div');
      this.instance = _reactDom2.default.render(this.ParentComponent, this.container);
      this.receiver = this.instance.refs.receiver;
    });

    it('should render nothing if isOpen is false', function test() {
      var receiver = _reactDom2.default.findDOMNode(this.receiver);
      expect(receiver).toBeNull();
      this.instance.setState({ isOpen: true });
    });

    it('should render a div wrapper with children if isOpen is true', function test() {
      this.instance.setState({ isOpen: true });
      var receiver = _reactDom2.default.findDOMNode(this.receiver);
      expect(receiver).toEqual(jasmine.any(HTMLDivElement));
      expect(receiver.firstElementChild).toEqual(jasmine.any(HTMLHeadingElement));
    });

    it('should render a div wrapper with customClass in string', function test() {
      var Component = createComponent();
      var template = createTemplate({ isOpen: true, files: [] }, { customClass: this.stringClass }, Component);

      this.createTestParent = _react2.default.createFactory(template);
      this.ParentComponent = this.createTestParent();
      this.container = document.createElement('div');
      this.instance = _reactDom2.default.render(this.ParentComponent, this.container);
      this.receiver = this.instance.refs.receiver;

      var receiver = _reactDom2.default.findDOMNode(this.receiver);
      expect(receiver.className).toEqual(this.stringClass);
    });

    it('should render a div wrapper with customClass in array', function test() {
      var Component = createComponent();
      var template = createTemplate({ isOpen: true, files: [] }, { customClass: this.arrayClass }, Component);

      this.createTestParent = _react2.default.createFactory(template);
      this.ParentComponent = this.createTestParent();
      this.container = document.createElement('div');
      this.instance = _reactDom2.default.render(this.ParentComponent, this.container);
      this.receiver = this.instance.refs.receiver;

      var receiver = _reactDom2.default.findDOMNode(this.receiver);
      expect(receiver.className).toEqual(this.arrayClass.join(' '));
    });
  });
});
/* eslint-enable no-undef */