import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { PENDING } from './constants/status';

class UploadHandler extends Component {
  componentDidMount() {
    const { file, upload, autoStart } = this.props;

    if (file.status === PENDING && autoStart) {
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
    const { file, key, customClass, style } = this.props;

    return (
      <div className={classNames(customClass)} style={style} key={key}>
        {
          !!this.props.children ? this.props.children : (
            <dl>
              <dh>{file.name}</dh>
              <dd>
                <span className="file__id">{file.id}</span>
                <span className="file__type">{file.type}</span>
                <span className="file__size">{file.size / 1000 / 1000} MB</span>
                <span className="file__progress">{file.progress}%</span>
                <span className="file__status">
                  {this.getStatusString(file.status)}
                </span>
              </dd>
            </dl>
          )
        }
      </div>
    );
  }
}

UploadHandler.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]),
  customClass: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  key: PropTypes.string,
  style: PropTypes.object,
  file: PropTypes.object.isRequired,
  upload: PropTypes.func.isRequired,
  autoStart: PropTypes.bool,
};

export default UploadHandler;
