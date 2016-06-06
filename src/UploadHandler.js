import React, { Component, PropTypes } from 'react';
import invariant from 'invariant';
import classNames from 'classnames';
import status from './constants/status';

class UploadHandler extends Component {
  constructor(props) {
    super(props);

    this._getStatusString = this._getStatusString.bind(this);
  }

  componentDidMount() {
    let { file, upload, autoStart } = this.props;

    if (file.status === status.PENDING && autoStart) {
      return upload(file);
    }
  }

  _getStatusString(status) {
    switch (status) {
      case -1:
        return 'failed';
        break;

      case 0:
        return 'pending';
        break;

      case 1:
        return 'uploading';
        break;

      case 2:
        return 'uploaded';
        break;
    }
  }

  render() {
    let { file, key, customClass, style } = this.props;

    return (
      <div className={classNames(customClass)} style={style} key={key}>
        {
          !!this.props.children ? this.props.children : (
            <dl>
              <dh>{ file.name }</dh>
              <dd>
                <span className="file__id">{ file.id } </span>
                <span className="file__type">{ file.type } </span>
                <span className="file__size">{ file.size / 1000 / 1000 } MB</span>
                <span className="file__progress">{ file.progress }%</span>
                <span className="file__status">
                  {this._getStatusString(file.status)}
                </span>
              </dd>
            </dl>
          )
        }
      </div>
    )
  }
}

UploadHandler.propTypes = {
  customClass: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]),
  style: PropTypes.object,
  file: PropTypes.object.isRequired,
  upload: PropTypes.func,
  autoStart: PropTypes.bool
};

export default UploadHandler;
