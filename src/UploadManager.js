import React, { Component, PropTypes, cloneElement } from 'react';
import invariant from 'invariant';
import classNames from 'classnames';
import assign from 'lodash/assign';
import bindKey from 'lodash/bindKey';
import clone from 'lodash/clone';
import request from 'superagent';
import uploadStatus from './constants/status';

const debug = require('debug')('react-file-upload:UploadManager');

class UploadManager extends Component {
  constructor(props) {
    super(props);

    this.upload = this.upload.bind(this);
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

  upload(url, file) {
    const {
      onUploadStart,
      onUploadEnd,
      onUploadProgress,
      uploadErrorHandler,
      uploadHeader = {},
    } = this.props;

    if (typeof onUploadStart === 'function') {
      onUploadStart(assign(file, { status: uploadStatus.UPLOADING }));
    }

    const formData = new FormData();
    formData.append('file', file);

    debug(`start uploading file#${file.id} to ${url}`, file);

    request
      .post(url)
      .accept('application/json')
      .set(uploadHeader)
      .send(formData)
      .on('progress', ({ percent }) => {
        if (typeof onUploadProgress === 'function') {
          onUploadProgress(assign(file, {
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
  uploadHeader: PropTypes.object,
};

UploadManager.defaultProps = {
  component: 'ul',
  uploadErrorHandler: (err, res) => {
    let error = null;
    const body = clone(res.body);

    if (err) {
      error = err.message;
    } else if (body && body.errors) {
      error = body.errors;
    }

    delete body.errors;

    return { error, result: body };
  },
};

export default UploadManager;
