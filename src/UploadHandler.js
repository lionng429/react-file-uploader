import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import uploadStatus from './constants/status';

const debug = require('debug')('react-file-upload:UploadHandler');

class UploadHandler extends Component {
  componentDidMount() {
    const { file, upload, autoStart } = this.props;

    if (file.status === uploadStatus.PENDING && autoStart) {
      debug('autoStart in on, calling upload()');
      upload(file);
    }
  }

  getStatusString(status) {
    switch (status) {
      case -1:
        return 'failed';

      case 0:
        return 'pending';

      case 1:
        return 'uploading';

      case 2:
        return 'uploaded';

      default:
        return '';
    }
  }

  render() {
    const { component, key, customClass, style } = this.props;

    return React.createElement(
      component,
      { key, className: classNames(customClass), style },
      this.props.children
    );
  }
}

UploadHandler.propTypes = {
  autoStart: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]),
  component: PropTypes.string.isRequired,
  customClass: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  file: PropTypes.object.isRequired,
  key: PropTypes.string,
  style: PropTypes.object,
  upload: PropTypes.func,
};

UploadHandler.defaultProps = {
  component: 'li',
};

export default UploadHandler;
