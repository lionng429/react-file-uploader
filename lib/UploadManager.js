'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _assign = require('lodash/assign');

var _assign2 = _interopRequireDefault(_assign);

var _bindKey = require('lodash/bindKey');

var _bindKey2 = _interopRequireDefault(_bindKey);

var _clone = require('lodash/clone');

var _clone2 = _interopRequireDefault(_clone);

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _status = require('./constants/status');

var _status2 = _interopRequireDefault(_status);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var debug = require('debug')('react-file-upload:UploadManager');

var UploadManager = function (_Component) {
  _inherits(UploadManager, _Component);

  function UploadManager(props) {
    _classCallCheck(this, UploadManager);

    var _this = _possibleConstructorReturn(this, (UploadManager.__proto__ || Object.getPrototypeOf(UploadManager)).call(this, props));

    _this.upload = _this.upload.bind(_this);
    return _this;
  }

  _createClass(UploadManager, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      (0, _invariant2.default)(!!this.props.uploadUrl, 'Upload end point must be provided to upload files');

      (0, _invariant2.default)(!!this.props.onUploadEnd, 'onUploadEnd function must be provided');
    }
  }, {
    key: 'upload',
    value: function upload(url, file) {
      var _props = this.props,
          onUploadStart = _props.onUploadStart,
          onUploadEnd = _props.onUploadEnd,
          onUploadProgress = _props.onUploadProgress,
          uploadErrorHandler = _props.uploadErrorHandler,
          _props$uploadHeader = _props.uploadHeader,
          uploadHeader = _props$uploadHeader === undefined ? {} : _props$uploadHeader,
          method = _props.method;


      if (typeof onUploadStart === 'function') {
        onUploadStart((0, _assign2.default)(file, { status: _status2.default.UPLOADING }));
      }

      var formData = new FormData();
      formData.append('file', file);

      debug('start uploading file#' + file.id + ' to ' + url, file);

      _superagent2.default[method.toLowerCase()](url).accept('application/json').set(uploadHeader).send(formData).on('progress', function (_ref) {
        var percent = _ref.percent;

        if (typeof onUploadProgress === 'function') {
          onUploadProgress((0, _assign2.default)(file, {
            progress: percent,
            status: _status2.default.UPLOADING
          }));
        }
      }).end(function (err, res) {
        var _uploadErrorHandler = uploadErrorHandler(err, res),
            error = _uploadErrorHandler.error,
            result = _uploadErrorHandler.result;

        if (error) {
          debug('failed to upload file', error);

          if (typeof onUploadEnd === 'function') {
            onUploadEnd((0, _assign2.default)(file, { error: error, status: _status2.default.FAILED }));
          }

          return;
        }

        debug('succeeded to upload file', res);

        if (typeof onUploadEnd === 'function') {
          onUploadEnd((0, _assign2.default)(file, { result: result, status: _status2.default.UPLOADED }));
        }
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props2 = this.props,
          component = _props2.component,
          customClass = _props2.customClass,
          style = _props2.style,
          children = _props2.children,
          uploadUrl = _props2.uploadUrl;


      return _react2.default.createElement(component, { className: (0, _classnames2.default)(customClass), style: style }, _react2.default.Children.map(children, function (child) {
        return (0, _react.cloneElement)(child, (0, _assign2.default)({
          upload: (0, _bindKey2.default)(_this2, 'upload', uploadUrl, child.props.file)
        }, child.props));
      }));
    }
  }]);

  return UploadManager;
}(_react.Component);

UploadManager.propTypes = {
  children: _react.PropTypes.oneOfType([_react.PropTypes.element, _react.PropTypes.arrayOf(_react.PropTypes.element)]),
  component: _react.PropTypes.string.isRequired,
  customClass: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.arrayOf(_react.PropTypes.string)]),
  onUploadStart: _react.PropTypes.func,
  onUploadProgress: _react.PropTypes.func,
  onUploadEnd: _react.PropTypes.func.isRequired,
  style: _react.PropTypes.object,
  uploadErrorHandler: _react.PropTypes.func.isRequired,
  uploadUrl: _react.PropTypes.string.isRequired,
  uploadHeader: _react.PropTypes.object,
  method: _react.PropTypes.string
};

UploadManager.defaultProps = {
  component: 'ul',
  method: 'post',
  uploadErrorHandler: function uploadErrorHandler(err, res) {
    var error = null;
    var body = (0, _clone2.default)(res.body);

    if (err) {
      error = err.message;
    } else if (body && body.errors) {
      error = body.errors;
    }

    delete body.errors;

    return { error: error, result: body };
  }
};

exports.default = UploadManager;