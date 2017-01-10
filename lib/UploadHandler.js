'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _status = require('./constants/status');

var _status2 = _interopRequireDefault(_status);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var debug = require('debug')('react-file-upload:UploadHandler');

var UploadHandler = function (_Component) {
  _inherits(UploadHandler, _Component);

  function UploadHandler() {
    _classCallCheck(this, UploadHandler);

    return _possibleConstructorReturn(this, (UploadHandler.__proto__ || Object.getPrototypeOf(UploadHandler)).apply(this, arguments));
  }

  _createClass(UploadHandler, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _props = this.props,
          file = _props.file,
          upload = _props.upload,
          autoStart = _props.autoStart;


      if (file.status === _status2.default.PENDING && autoStart) {
        debug('autoStart in on, calling upload()');
        upload(file);
      }
    }
  }, {
    key: 'getStatusString',
    value: function getStatusString(status) {
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
  }, {
    key: 'render',
    value: function render() {
      var _props2 = this.props,
          component = _props2.component,
          key = _props2.key,
          customClass = _props2.customClass,
          style = _props2.style;


      return _react2.default.createElement(component, { key: key, className: (0, _classnames2.default)(customClass), style: style }, this.props.children);
    }
  }]);

  return UploadHandler;
}(_react.Component);

UploadHandler.propTypes = {
  autoStart: _react.PropTypes.bool,
  children: _react.PropTypes.oneOfType([_react.PropTypes.element, _react.PropTypes.arrayOf(_react.PropTypes.element)]),
  component: _react.PropTypes.string.isRequired,
  customClass: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.arrayOf(_react.PropTypes.string)]),
  file: _react.PropTypes.object.isRequired,
  key: _react.PropTypes.string,
  style: _react.PropTypes.object,
  upload: _react.PropTypes.func
};

UploadHandler.defaultProps = {
  component: 'li'
};

exports.default = UploadHandler;