import React, { Component, PropTypes, cloneElement } from 'react';
import invariant from 'invariant';
import classNames from 'classnames';
import { bindKey, merge } from 'lodash';
import request from 'superagent';
import status from './constants/status';

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
  }

  upload(url, file) {
    const { onUploadStart, onUploadProgress, onUploadEnd } = this.props;

    if (typeof onUploadStart === 'function') {
      onUploadStart(merge(file, { status: status.UPLOADING }));
    }

    const formData = new FormData();
    formData.append('file', file);

    request
      .post(url)
      .accept('application/json')
      .send(formData)
      .on('progress', ({ percent }) => {
        if (typeof onUploadProgress === 'function') {
          onUploadProgress(merge(file, { progress: percent, status: status.UPLOADING }));
        }
      })
      .end((err, res) => {
        if (err) {
          if (typeof onUploadEnd === 'function') {
            onUploadEnd(merge(file, { error: err, status: status.FAILED }));
          }
        }

        if (typeof onUploadEnd === 'function') {
          onUploadEnd(merge(file, { result: res.body, status: status.UPLOADED }));
        }
      });
  }

  render() {
    const { customClass, style, children, uploadUrl } = this.props;

    return (
      <div className={classNames(customClass)} style={style}>
        {
          React.Children.map(children, (child) => {
            if (child.type.name === 'UploadHandler') {
              return cloneElement(child, merge({
                upload: bindKey(this, 'upload', uploadUrl, child.props.file),
              }, child.props));
            }

            return child;
          })
        }
      </div>
    );
  }
}

UploadManager.propTypes = {
  files: PropTypes.array,
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]),
  customClass: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  style: PropTypes.object,
  uploadUrl: PropTypes.string.isRequired,
  onUploadStart: PropTypes.func,
  onUploadProgress: PropTypes.func,
  onUploadEnd: PropTypes.func.isRequired,
};

export default UploadManager;
