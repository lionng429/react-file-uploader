import React, { Component, cloneElement } from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';
import classNames from 'classnames';
import bindKey from 'lodash/bindKey';
import clone from 'lodash/clone';
import superagent from 'superagent';
import uploadStatus from './constants/status';

const debug = require('debug')('react-file-uploader:UploadManager');

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
      reqConfigs: {
        accept = 'application/json',
        method = 'post',
        timeout,
        withCredentials = false,
      },
      onUploadStart,
      onUploadEnd,
      onUploadProgress,
      formDataParser,
      uploadErrorHandler,
      uploadHeader = {},
    } = this.props;

    if (typeof onUploadStart === 'function') {
      onUploadStart(Object.assign({}, file, { status: uploadStatus.UPLOADING }));
    }

    let formData = new FormData();
    formData = formDataParser(formData, file);

    const request = superagent[method.toLowerCase()](url)
      .accept(accept)
      .set(uploadHeader);

    if (timeout) {
      request.timeout(timeout);
    }

    if (withCredentials) {
      request.withCredentials();
    }

    debug(`start uploading file#${file.id} to ${url}`, file);

    request
      .send(formData)
      .on('progress', ({ percent }) => {
        if (typeof onUploadProgress === 'function') {
          onUploadProgress(Object.assign({}, file, {
            progress: percent,
            status: uploadStatus.UPLOADING,
          }));
        }
      })
      .end((err, res) => {
        const { error, result } = uploadErrorHandler(err, res);

        if (error) {
          debug('failed to upload file', error);
        } else {
          debug('succeeded to upload file', result);
        }

        if (typeof onUploadEnd === 'function') {
          onUploadEnd(Object.assign({}, file, {
            error,
            result,
            status: error && uploadStatus.FAILED || uploadStatus.UPLOADED
          }));
        }
      });
  }

  render() {
    const { component, customClass, style, children, uploadUrl } = this.props;

    return React.createElement(
      component,
      { className: classNames(customClass), style },
      React.Children.map(children, child => cloneElement(child, Object.assign({
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
  formDataParser: PropTypes.func,
  onUploadStart: PropTypes.func,
  onUploadProgress: PropTypes.func,
  onUploadEnd: PropTypes.func.isRequired,
  reqConfigs: PropTypes.shape({
    accept: PropTypes.string,
    method: PropTypes.string,
    timeout: PropTypes.shape({
      response: PropTypes.number,
      deadline: PropTypes.number,
    }),
    withCredentials: PropTypes.bool,
  }),
  style: PropTypes.object,
  uploadErrorHandler: PropTypes.func,
  uploadUrl: PropTypes.string.isRequired,
  uploadHeader: PropTypes.object,
};

UploadManager.defaultProps = {
  component: 'ul',
  formDataParser: (formData, file) => {
    formData.append('file', file);
    return formData;
  },
  reqConfigs: {},
  uploadErrorHandler: (err, res = {}) => {
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
