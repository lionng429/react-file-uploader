/* eslint-disable no-undef, max-len */
jest.dontMock('../Receiver');
jest.dontMock('../index');
jest.dontMock('classnames');

import React from 'react';
import { mount, shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { jsdom } from 'jsdom';

const FileUploader = require('../index');
const { PENDING } = FileUploader.status;
const Receiver = FileUploader.Receiver;

configure({ adapter: new Adapter() });

const testFile = {
  lastModified: 1465229147840,
  lastModifiedDate: 'Tue Jun 07 2016 00:05:47 GMT+0800 (HKT)',
  name: 'test.jpg',
  size: 1024,
  type: 'image/jpg',
  webkitRelativePath: '',
};

const files = [testFile];

const createEvent = (eventName) => {
  const event = document.createEvent('HTMLEvents');
  event.initEvent(eventName, false, true);
  event.preventDefault = jest.genMockFn();
  event.dataTransfer = {
    files,
    setData: jest.genMockFunction(),
    types: ['Files']
  };

  return event;
};

describe('Receiver', () => {
  let dragEnterEvent,
    dragOverEvent,
    dragLeaveEvent,
    dropEvent,
    stringClass = 'receiver',
    arrayClass = ['react', 'receiver'];

  beforeEach(() => {
    global.document = jsdom();
    global.window = document.parentWindow;
    global.window.DragEvent = 'DragEvent';
    global.window.DataTransfer = 'DataTransfer';

    dragEnterEvent = createEvent('dragenter');
    dragOverEvent = createEvent('dragover');
    dragLeaveEvent = createEvent('dragleave');
    dropEvent = createEvent('drop');
  });

  describe('constructor', () => {
    let emptyFn = () => {},
      component = (
        <Receiver
          onDragEnter={emptyFn}
          onDragOver={emptyFn}
          onDragLeave={emptyFn}
          onFileDrop={emptyFn}
        />
      );

    it('should throw an error if DnD or File API is not supported', () => {
      global.window.DragEvent = undefined;
      global.window.DataTransfer = undefined;

      expect(() => shallow(component)).toThrow('Browser does not support DnD events or File API.');
    });

    it('should assign window to this.wrapper if no wrapperId is provided', () => {
      const receiver = shallow(component);
      expect(receiver.instance().wrapper).toEqual(global.window);
    });

    it('should throw an error if wrapperId is given but element is not found', () => {
      expect(() => shallow(
        <Receiver
          wrapperId="random"
          onDragEnter={emptyFn}
          onDragOver={emptyFn}
          onDragLeave={emptyFn}
          onFileDrop={emptyFn}
        />
      )).toThrow();
    });

    it('should not throw an error if wrapperId is given and the element exists', () => {
      expect(() => mount((
        <div id="wrapper">
          <Receiver
            wrapperId="wrapper"
            onDragEnter={emptyFn}
            onDragOver={emptyFn}
            onDragLeave={emptyFn}
            onFileDrop={emptyFn}
          />
        </div>
      ), { attachTo: document.body })).not.toThrow();
    });
  });

  describe('state of dragLevel', () => {
    let receiver,
      onDragEnter,
      onDragOver,
      onDragLeave,
      onFileDrop;

    beforeEach(() => {
      const mockOnDragEnter = jest.genMockFn();
      const mockOnDragOver = jest.genMockFn();
      const mockOnDragLeave = jest.genMockFn();
      const mockOnFileDrop = jest.genMockFn();

      onDragEnter = mockOnDragEnter;
      onDragOver = mockOnDragOver;
      onDragLeave = mockOnDragLeave;
      onFileDrop = mockOnFileDrop;

      const component = (
        <Receiver
          isOpen={false}
          files={[]}
          onDragEnter={onDragEnter}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onFileDrop={onFileDrop}
        />
      );

      receiver = shallow(component);
    });

    it('should increase state of dragLevel by 1 with dragEnter event', () => {
      const oldDragLevel = receiver.state().dragLevel;
      window.dispatchEvent(dragEnterEvent);
      const newDragLevel = receiver.state().dragLevel;
      expect(newDragLevel).toEqual(oldDragLevel + 1);
    });

    it('should call onDragEnter with dragEnter event if isOpen is false', () => {
      window.dispatchEvent(dragEnterEvent);
      expect(onDragEnter).toBeCalled();
    });

    it('should not call onDragEnter with dragEnter event if isOpen is true', () => {
      receiver.setProps({ isOpen: true });
      window.dispatchEvent(dragEnterEvent);
      expect(onDragEnter).not.toBeCalled();
    });

    it('should not call onDragEnter callback with dragEnter event if dataTransfer.types does not include `Files`', () => {
      onDragEnter = jest.genMockFn();
      dragEnterEvent.dataTransfer.types = ['HTMLElement'];

      receiver.setProps({ onDragEnter });

      window.dispatchEvent(dragEnterEvent);
      expect(onDragEnter).not.toBeCalled();
    });

    it('should call event.preventDefault with dragOver event', () => {
      window.dispatchEvent(dragOverEvent);
      expect(dragOverEvent.preventDefault).toBeCalled();
    });

    it('should call onDragOver with dragOver event', () => {
      window.dispatchEvent(dragOverEvent);
      expect(onDragOver).toBeCalled();
    });

    it('should decrease state of dragLevel by 1 with dragLeave event', () => {
      const oldDragLevel = receiver.state().dragLevel;
      window.dispatchEvent(dragEnterEvent);
      const newDragLevel = receiver.state().dragLevel;
      expect(newDragLevel).toEqual(oldDragLevel + 1);

      window.dispatchEvent(dragLeaveEvent);
      const finalDragLevel = receiver.state().dragLevel;
      expect(finalDragLevel).toEqual(newDragLevel - 1);
      expect(onDragLeave).toBeCalled();
    });

    it('should call onDragLeave if state of dragLevel is not 0', () => {
      const oldDragLevel = receiver.state().dragLevel;
      window.dispatchEvent(dragEnterEvent);
      const newDragLevel = receiver.state().dragLevel;
      expect(newDragLevel).toEqual(oldDragLevel + 1);

      window.dispatchEvent(dragEnterEvent);
      const newerDragLevel = receiver.state().dragLevel;
      expect(newerDragLevel).toEqual(newDragLevel + 1);

      window.dispatchEvent(dragLeaveEvent);
      const finalDragLevel = receiver.state().dragLevel;
      expect(finalDragLevel).toEqual(newerDragLevel - 1);
      expect(onDragLeave).not.toBeCalled();

      window.dispatchEvent(dragLeaveEvent);
      const endDragLevel = receiver.state().dragLevel;
      expect(endDragLevel).toEqual(finalDragLevel - 1);
      expect(onDragLeave).toBeCalled();
    });

    it('should call event.preventDefault with drop event', () => {
      window.dispatchEvent(dropEvent);
      // eslint-disable-next-line no-undef
      expect(dropEvent.preventDefault).toBeCalled();
    });

    it('should call onFileDrop with drop event', () => {
      window.dispatchEvent(dropEvent);
      expect(onFileDrop).toBeCalled();
    });

    it('should set state of dragLevel to 0 with dragEnter event', () => {
      const oldDragLevel = receiver.state().dragLevel;
      window.dispatchEvent(dragEnterEvent);
      const newDragLevel = receiver.state().dragLevel;
      expect(newDragLevel).toEqual(oldDragLevel + 1);

      window.dispatchEvent(dropEvent);
      const finalDragLevel = receiver.state().dragLevel;
      expect(finalDragLevel).toEqual(0);
    });

    it('should not call any callback after Receiver did unmount', () => {
      receiver.unmount();
      window.dispatchEvent(dragEnterEvent);
      expect(onDragEnter).not.toBeCalled();

      window.dispatchEvent(dragOverEvent);
      expect(onDragOver).not.toBeCalled();

      window.dispatchEvent(dragLeaveEvent);
      expect(onDragLeave).not.toBeCalled();

      window.dispatchEvent(dropEvent);
      expect(onFileDrop).not.toBeCalled();
    });
  });

  describe('callbacks and callback arguments', () => {
    let onDragEnter,
      onDragOver,
      onDragLeave,
      onFileDrop;

    beforeEach(() => {
      const mockOnDragEnter = (e) => {
        expect(e.type).toBe('dragenter');
      };
      const mockOnDragOver = (e) => {
        expect(e.type).toBe('dragover');
      };
      const mockOnDragLeave = (e) => {
        expect(e.type).toBe('dragleave');
      };
      const mockOnFileDrop = (e, _files) => {
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

      onDragEnter = mockOnDragEnter;
      onDragOver = mockOnDragOver;
      onDragLeave = mockOnDragLeave;
      onFileDrop = mockOnFileDrop;

      const component = (
        <Receiver
          isOpen={false}
          files={[]}
          onDragEnter={onDragEnter}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onFileDrop={onFileDrop}
        />
      );

      shallow(component);
    });

    it('should execute the onDragEnter callback with a DragEvent with type `dragenter` as argument', () => {
      window.dispatchEvent(dragEnterEvent);
    });

    it('should execute the onDragOver callback with a DragEvent with type `dragover` as argument', () => {
      window.dispatchEvent(dragOverEvent);
    });

    it('should execute the onDragLeave callback with a DragEvent with type `dragleave` as argument', () => {
      window.dispatchEvent(dragLeaveEvent);
    });

    it('should execute the onFileDrop callback with a DragEvent with type `drop` as argument', () => {
      window.dispatchEvent(dropEvent);
    });
  });

  describe('render()', () => {
    let receiver,
      childrenItems = Array(5).fill().map((value, index) => (<li key={index}>{index}</li>));

    beforeEach(() => {
      const mockOnDragEnter = jest.genMockFn();
      const mockOnDragOver = jest.genMockFn();
      const mockOnDragLeave = jest.genMockFn();
      const mockOnFileDrop = jest.genMockFn();

      const component = (
        <Receiver
          isOpen={false}
          files={[]}
          onDragEnter={mockOnDragEnter}
          onDragOver={mockOnDragOver}
          onDragLeave={mockOnDragLeave}
          onFileDrop={mockOnFileDrop}
        >
          {childrenItems}
        </Receiver>
      );

      receiver = shallow(component);
    });

    it('should render nothing if isOpen is false', () => {
      expect(receiver.type()).toEqual(null);
      expect(receiver.children().exists()).toBe(false);
    });

    it('should render a div wrapper with children if isOpen is true', () => {
      receiver.setProps({ isOpen: true });
      expect(receiver.type()).toEqual('div');
      expect(receiver.children().length).toEqual(childrenItems.length);
    });

    it('should render a div wrapper with customClass in string', () => {
      receiver.setProps({ isOpen: true, customClass: stringClass });
      expect(receiver.hasClass(stringClass)).toBe(true);
    });

    it('should render a div wrapper with customClass in array', () => {
      receiver.setProps({ isOpen: true, customClass: arrayClass });
      arrayClass.forEach((classname) => {
        expect(receiver.hasClass(classname)).toBe(true);
      });
    });
  });
});
/* eslint-enable no-undef, max-len */
