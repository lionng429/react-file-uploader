import React, { Component, cloneElement } from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';
import classNames from 'classnames';
import bindKey from 'lodash/bindKey';
import clone from 'lodash/clone';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import superagent from 'superagent';
import uploadStatus from './constants/status';

const debug = require('debug')('react-file-uploader:UploadManager');

class UploadManager extends Component {
  constructor(props) {
    super(props);

    this.requests = {};
    this.abort = this.abort.bind(this);
    this.upload = this.upload.bind(this);
    this.onProgress = debounce(this.onProgress.bind(this), props.progressDebounce);
  }

  componentDidMount() {
    // eslint-disable-next-line react/prop-types
    if (this.props.uploadHeader) {
      // eslint-disable-next-line no-console
      console.warn('`props.uploadHeader` is DEPRECATED. Please use `props.uploadHeaderHandler` instead.');
    }

    // eslint-disable-next-line react/prop-types
    if (this.props.formDataParser) {
      // eslint-disable-next-line no-console
      console.warn('`props.formDataParser` is DEPRECATED. Please use `props.uploadDataHandler` instead.');
    }

    invariant(
      !!this.props.uploadUrl,
      'Upload end point must be provided to upload files'
    );

    invariant(
      !!this.props.onUploadEnd,
      'onUploadEnd function must be provided'
    );
  }

  onProgress(fileId, progress) {
    const { onUploadProgress } = this.props,
      request = this.requests[fileId];

    if (request.xhr && request.xhr.readyState !== 4 && !request.aborted) {
      if (typeof onUploadProgress === 'function') {
        onUploadProgress(fileId, {
          progress,
          status: uploadStatus.UPLOADING,
        });
      }
    }
  }

  abort(file = {}) {
    const { onUploadAbort } = this.props,
      request = this.requests[file.id];

    if (!request) {
      debug('request instance not found.');
      return;
    }

    request.abort();

    if (typeof onUploadAbort === 'function') {
      onUploadAbort(file.id, { status: uploadStatus.ABORTED });
    }
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
      uploadDataHandler,
      uploadErrorHandler,
      uploadHeaderHandler,
    } = this.props;

    if (typeof onUploadStart === 'function') {
      onUploadStart(file.id, { status: uploadStatus.UPLOADING });
    }

    let header = uploadHeaderHandler(file),
      data = uploadDataHandler(file);

    let request = superagent[method.toLowerCase()](url)
      .accept(accept);

    if (!isEmpty(header)) {
      request.set(header);
    }

    if (timeout) {
      request.timeout(timeout);
    }

    if (withCredentials) {
      request.withCredentials();
    }

    this.requests[file.id] = request;

    debug(`start uploading file#${file.id} to ${url}`, file);

    request
      .send(data)
      .on('progress', ({ percent }) => this.onProgress(file.id, percent))
      .end((err, res) => {
        const { error, result } = uploadErrorHandler(err, res);

        if (error) {
          debug('failed to upload file', error);
        } else {
          debug('succeeded to upload file', result);
        }

        if (typeof onUploadEnd === 'function') {
          onUploadEnd(file.id, {
            progress: error && 0 || 100,
            error,
            result: error && undefined || result,
            status: error && uploadStatus.FAILED || uploadStatus.UPLOADED
          });
        }
      });
  }

  render() {
    const { component, customClass, style, children, uploadUrl } = this.props;

    return React.createElement(
      component,
      { className: classNames(customClass), style },
      React.Children.map(children, child => cloneElement(child, Object.assign({
        abort: bindKey(this, 'abort', child.props.file),
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
  onUploadAbort: PropTypes.func,
  onUploadStart: PropTypes.func,
  onUploadProgress: PropTypes.func,
  onUploadEnd: PropTypes.func.isRequired,
  progressDebounce: PropTypes.number,
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
  uploadDataHandler: PropTypes.func,
  uploadErrorHandler: PropTypes.func,
  uploadHeaderHandler: PropTypes.func,
  uploadUrl: PropTypes.string.isRequired,
};

UploadManager.defaultProps = {
  component: 'ul',
  progressDebounce: 150,
  reqConfigs: {},
  uploadDataHandler: (file) => {
    const formData = new FormData();
    formData.append('file', file.data);
    return formData;
  },
  uploadErrorHandler: (err, res = {}) => {
    const body = res.body ? clone(res.body) : {};
    let error = null;

    if (err) {
      error = err.message;
    } else if (body.errors) {
      error = body.errors;
    }

    delete body.errors;

    return { error, result: body };
  },
  uploadHeaderHandler: () => ({})
};

export default UploadManager;
