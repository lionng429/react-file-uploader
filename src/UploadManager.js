import React, { Component, PropTypes, cloneElement } from 'react';
import invariant from 'invariant';
import classNames from 'classnames';
import assign from 'lodash/assign';
import bindKey from 'lodash/bindKey';
import debounce from 'lodash/debounce';
import request from 'superagent';
import uploadStatus from './constants/status';

const debug = require('debug')('UploadManager');

class UploadManager extends Component {
  constructor(props) {
    super(props);

    this.upload = this.upload.bind(this);
    this.onUploadProgress = this.onUploadProgress.bind(this);
  }

  componentDidMount() {
    invariant(
      !!this.props.uploadUrl,
      'Upload end point must be provided to upload files'
    );

    invariant(
      !!this.props.onUploadEnd,
      'onUploadEnd function must be provided'
    );
  }

  onUploadProgress() {
    const { onUploadProgress } = this.props;

    if (onUploadProgress && typeof onUploadProgress === 'function') {
      return debounce(this.props.onUploadProgress, 150);
    }

    return () => debug('onUploadProgress is not provided in props');
  }

  upload(url, file) {
    const { onUploadStart, onUploadProgress, onUploadEnd, uploadErrorHandler } = this.props;

    if (typeof onUploadStart === 'function') {
      onUploadStart(assign(file, { status: uploadStatus.UPLOADING }));
    }

    const formData = new FormData();
    formData.append('file', file);

    debug(`start uploading file#${file.id} to ${url}`, file);

    request
      .post(url)
      .accept('application/json')
      .send(formData)
      .on('progress', ({ percent }) => {
        debug(`file upload in progress: ${percent}%`);

        if (typeof onUploadProgress === 'function') {
          this.onUploadProgress(assign(file, {
            progress: percent,
            status: uploadStatus.UPLOADING,
          }));
        }
      })
      .end((err, res) => {
        const { error, result } = uploadErrorHandler(err, res);

        if (error) {
          debug('failed to upload file', error);

          if (typeof onUploadEnd === 'function') {
            onUploadEnd(assign(file, { error, status: uploadStatus.FAILED }));
          }

          return;
        }

        debug('succeeded to upload file', res);

        if (typeof onUploadEnd === 'function') {
          onUploadEnd(assign(file, { result, status: uploadStatus.UPLOADED }));
        }
      });
  }

  render() {
    const { component, customClass, style, children, uploadUrl } = this.props;

    return React.createElement(
      component,
      { className: classNames(customClass), style },
      React.Children.map(children, child => cloneElement(child, assign({
        upload: bindKey(this, 'upload', uploadUrl, child.props.file),
      }, child.props)))
    );
  }
}

UploadManager.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]),
  component: PropTypes.string.isRequired,
  customClass: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  onUploadStart: PropTypes.func,
  onUploadProgress: PropTypes.func,
  onUploadEnd: PropTypes.func.isRequired,
  style: PropTypes.object,
  uploadErrorHandler: PropTypes.func.isRequired,
  uploadUrl: PropTypes.string.isRequired,
};

UploadManager.defaultProps = {
  component: 'ul',
  uploadErrorHandler: (err, res) => {
    let error;
    const body = res.body;

    if (err) {
      error = err;
    } else if (body && body.errors) {
      error = body.errors;
    }

    delete body.errors;

    return { error, result: body };
  },
};

export default UploadManager;
