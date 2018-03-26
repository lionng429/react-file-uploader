import React, { Component } from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';
import classNames from 'classnames';
import uploadStatus from './constants/status';

const debug = require('debug')('react-file-uploader:UploadHandler');

class UploadHandler extends Component {
  componentDidMount() {
    const { file, upload, autoStart } = this.props;

    invariant(
      typeof upload === 'function',
      '`props.upload` must be a function'
    );

    invariant(
      !!file,
      '`props.file` must be provided'
    );

    if (file.status === uploadStatus.PENDING && autoStart) {
      debug('autoStart in on, calling upload()');
      upload(file);
    }
  }

  render() {
    const { abort, component, customClass, style, upload } = this.props;

    return React.createElement(
      component,
      { className: classNames(customClass), style },
      typeof this.props.children === 'function' ? this.props.children({ upload, abort }, this) : this.props.children
    );
  }
}

UploadHandler.propTypes = {
  abort: PropTypes.func.isRequired,
  autoStart: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.func,
  ]),
  component: PropTypes.string.isRequired,
  customClass: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  file: PropTypes.object.isRequired,
  style: PropTypes.object,
  upload: PropTypes.func.isRequired,
};

UploadHandler.defaultProps = {
  component: 'li',
};

export default UploadHandler;
