/* eslint-disable no-undef */
jest.dontMock('../Receiver');
jest.dontMock('../index');
/* eslint-enable no-undef */

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import { jsdom } from 'jsdom';

const FileUploader = require('../index');
const Receiver = FileUploader.Receiver;

/* eslint-disable no-undef */
describe('Receiver', () => {
  beforeEach(function setting() {
    /* eslint-enable no-undef */
    global.document = jsdom();
    global.window = document.parentWindow;

    /* eslint-disable no-undef */
    const onDragEnter = jest.genMockFn();
    const onDragOver = jest.genMockFn();
    const onDragLeave = jest.genMockFn();
    const onFileDrop = jest.genMockFn();
    /* eslint-enable no-undef */

    this.onDragEnter = onDragEnter;
    this.onDragOver = onDragOver;
    this.onDragLeave = onDragLeave;
    this.onFileDrop = onFileDrop;

    // eslint-disable-next-line react/prefer-es6-class
    const testParentTemplate = React.createClass({
      getInitialState() {
        return {
          isOpen: false,
          files: [],
        };
      },
      render() {
        return (
          <Receiver
            ref="receiver"
            isOpen={this.state.isOpen}
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onFileDrop={onFileDrop}
          />
        );
      },
    });

    this.createTestParent = React.createFactory(testParentTemplate);

    this.ParentComponent = this.createTestParent();
    this.parent = TestUtils.renderIntoDocument(this.ParentComponent);
    this.parentNode = ReactDOM.findDOMNode(this.parent);
    this.receiver = this.parent.refs.receiver;

    global.window.addEventListener('dragenter', this.receiver.onDragEnter);
    global.window.addEventListener('dragover', this.receiver.onDragOver);
    global.window.addEventListener('dragleave', this.receiver.onDragLeave);
    global.window.addEventListener('drop', this.receiver.onFileDrop);

    this.dragEnterEvent = document.createEvent('HTMLEvents');
    this.dragEnterEvent.initEvent('dragenter', false, true);

    this.dragOverEvent = document.createEvent('HTMLEvents');
    this.dragOverEvent.initEvent('dragover', false, true);
    // eslint-disable-next-line no-undef
    this.dragOverEvent.preventDefault = jest.genMockFn();

    this.dragLeaveEvent = document.createEvent('HTMLEvents');
    this.dragLeaveEvent.initEvent('dragleave', false, true);
  });

  // eslint-disable-next-line no-undef
  it('will increase state of dropLevel by 1 with dragEnter event', function test() {
    const oldDragLevel = this.receiver.state.dragLevel;
    window.dispatchEvent(this.dragEnterEvent);
    const newDragLevel = this.receiver.state.dragLevel;
    // eslint-disable-next-line no-undef
    expect(newDragLevel).toEqual(oldDragLevel + 1);
  });

  // eslint-disable-next-line no-undef
  it('will call onDragEnter with dragEnter event if isOpen is false', function test() {
    window.dispatchEvent(this.dragEnterEvent);
    // eslint-disable-next-line no-undef
    expect(this.onDragEnter).toBeCalled();
  });

  // eslint-disable-next-line no-undef
  it('will not call onDragEnter with dragEnter event if isOpen is true', function test() {
    this.parent.setState({ isOpen: true });
    window.dispatchEvent(this.dragEnterEvent);
    // eslint-disable-next-line no-undef
    expect(this.onDragEnter).not.toBeCalled();
  });

  // eslint-disable-next-line no-undef
  it('will call event.preventDefault with dragOver event', function test() {
    window.dispatchEvent(this.dragOverEvent);
    // eslint-disable-next-line no-undef
    expect(this.dragOverEvent.preventDefault).toBeCalled();
  });
});
