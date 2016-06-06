import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { suid } from 'rand-token';
import status from './constants/status';

class Receiver extends Component {
  constructor(props) {
    super(props);

    this.onDragEnter = this.onDragEnter.bind(this);
    this.onDragOver = this.onDragOver.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.onFileDrop = this.onFileDrop.bind(this);

    // this is to monitor the hierarchy
    // for window onDragEnter event
    this.state = {
      dragLevel: 0,
    };
  }

  componentDidMount() {
    window.addEventListener('dragenter', this.onDragEnter);
    window.addEventListener('dragleave', this.onDragLeave);
    window.addEventListener('dragover', this.onDragOver);
    window.addEventListener('drop', this.onFileDrop);
  }

  componentWillUnmount() {
    window.removeEventListener('dragenter', this.onDragEnter);
    window.removeEventListener('dragleave', this.onDragLeave);
    window.removeEventListener('dragover', this.onDragOver);
    window.removeEventListener('drop', this.onFileDrop);
  }

  onDragEnter(e) {
    const dragLevel = this.state.dragLevel + 1;

    this.setState({ dragLevel });

    if (!this.props.isOpen) {
      this.props.onDragEnter(e);
    }
  }

  onDragLeave(e) {
    const dragLevel = this.state.dragLevel - 1;

    this.setState({ dragLevel });

    if (dragLevel === 0) {
      this.props.onDragLeave(e);
    }
  }

  onDragOver(e) {
    e.preventDefault();
    return this.props.onDragOver(e);
  }

  onFileDrop(e) {
    // eslint-disable-next-line no-param-reassign
    e = e || window.event;
    e.preventDefault();

    const fileList = e.dataTransfer.files;
    const files = [];

    for (let i = 0; i < fileList.length; i ++) {
      fileList[i].id = suid(4);
      fileList[i].status = status.PENDING;
      fileList[i].progress = 0;
      fileList[i].src = null;
      files.push(fileList[i]);
    }

    // reset drag level once dropped
    this.setState({ dragLevel: 0 });

    return this.props.onFileDrop(e.target, files);
  }

  render() {
    const { isOpen, customClass, style, children } = this.props;

    return (
      isOpen ? (
        <div className={classNames(customClass)} style={style}>
          {children}
        </div>
      ) : null
    );
  }
}

Receiver.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  customClass: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  style: PropTypes.object,
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]),
  onDragEnter: PropTypes.func.isRequired,
  onDragOver: PropTypes.func,
  onDragLeave: PropTypes.func.isRequired,
  onFileDrop: PropTypes.func.isRequired,
};

export default Receiver;
