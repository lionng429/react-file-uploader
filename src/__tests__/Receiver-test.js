jest.dontMock('../Receiver');
jest.dontMock('../index');

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import { jsdom } from 'jsdom';

const FileUploader = require('../index');
const Receiver = FileUploader.Receiver;

describe('Receiver', () => {
  const mockDT = { setData: jest.genMockFunction() };
  const getMockEvent = function(type) { return { type, dataTransfer: mockDT, preventDefault: jest.genMockFn() }};

  beforeEach(function() {
    global.document = jsdom();
    global.window = document.parentWindow;

    const onDragEnter = jest.genMockFn();
    const onDragOver = jest.genMockFn();
    const onDragLeave = jest.genMockFn();
    const onFileDrop = jest.genMockFn();

    this.onDragEnter = onDragEnter;
    this.onDragOver = onDragOver;
    this.onDragLeave = onDragLeave;
    this.onFileDrop = onFileDrop;

    this.TestParent = React.createFactory(React.createClass({
      getInitialState() { return { isOpen: false, files: [] } },
      render() {
        return (
          <Receiver ref="receiver"
            isOpen={this.state.isOpen}
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onFileDrop={onFileDrop}
          />
        );
      }
    }));

    this.ParentComponent = this.TestParent();
    this.parent = TestUtils.renderIntoDocument(this.ParentComponent);
    this.parentNode = ReactDOM.findDOMNode(this.parent);
    this.receiver = this.parent.refs.receiver;

    global.window.addEventListener('dragenter', this.receiver.onDragEnter);
    global.window.addEventListener('dragover', this.receiver.onDragOver);
    global.window.addEventListener('dragleave', this.receiver.onDragLeave);
    global.window.addEventListener('drop', this.receiver.onFileDrop);

    this.dragEnterEvent = document.createEvent("HTMLEvents");
    this.dragEnterEvent.initEvent("dragenter", false, true);

    this.dragOverEvent = document.createEvent("HTMLEvents");
    this.dragOverEvent.initEvent("dragover", false, true);
    this.dragOverEvent.preventDefault = jest.genMockFn();

    this.dragLeaveEvent = document.createEvent("HTMLEvents");
    this.dragLeaveEvent.initEvent("dragleave", false, true);
  });

  it('will increase state of dropLevel by 1 with dragEnter event', function() {
    let oldDragLevel = this.receiver.state.dragLevel;
    window.dispatchEvent(this.dragEnterEvent);
    let newDragLevel = this.receiver.state.dragLevel;
    expect(newDragLevel).toEqual(oldDragLevel + 1);
  });

  it('will call onDragEnter with dragEnter event if isOpen is false', function() {
    window.dispatchEvent(this.dragEnterEvent);
    expect(this.onDragEnter).toBeCalled();
  });

  it('will not call onDragEnter with dragEnter event if isOpen is true', function() {
    this.parent.setState({ isOpen: true });
    window.dispatchEvent(this.dragEnterEvent);
    expect(this.onDragEnter).not.toBeCalled();
  });

  it('will call event.preventDefault with dragOver event', function() {
    window.dispatchEvent(this.dragOverEvent);
    expect(this.dragOverEvent.preventDefault).toBeCalled();
  });
});