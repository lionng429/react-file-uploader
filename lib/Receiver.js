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

var _shortid = require('shortid');

var _shortid2 = _interopRequireDefault(_shortid);

var _status = require('./constants/status');

var _status2 = _interopRequireDefault(_status);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Receiver = function (_Component) {
  _inherits(Receiver, _Component);

  function Receiver(props) {
    _classCallCheck(this, Receiver);

    var _this = _possibleConstructorReturn(this, (Receiver.__proto__ || Object.getPrototypeOf(Receiver)).call(this, props));

    _this.onDragEnter = _this.onDragEnter.bind(_this);
    _this.onDragOver = _this.onDragOver.bind(_this);
    _this.onDragLeave = _this.onDragLeave.bind(_this);
    _this.onFileDrop = _this.onFileDrop.bind(_this);

    // this is to monitor the hierarchy
    // for window onDragEnter event
    _this.state = {
      dragLevel: 0
    };
    return _this;
  }

  _createClass(Receiver, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      (0, _invariant2.default)(!!window.DragEvent && !!window.DataTransfer, 'Upload end point must be provided to upload files');

      window.addEventListener('dragenter', this.onDragEnter);
      window.addEventListener('dragleave', this.onDragLeave);
      window.addEventListener('dragover', this.onDragOver);
      window.addEventListener('drop', this.onFileDrop);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      window.removeEventListener('dragenter', this.onDragEnter);
      window.removeEventListener('dragleave', this.onDragLeave);
      window.removeEventListener('dragover', this.onDragOver);
      window.removeEventListener('drop', this.onFileDrop);
    }
  }, {
    key: 'onDragEnter',
    value: function onDragEnter(e) {
      var dragLevel = this.state.dragLevel + 1;

      this.setState({ dragLevel: dragLevel });

      if (!this.props.isOpen) {
        this.props.onDragEnter(e);
      }
    }
  }, {
    key: 'onDragLeave',
    value: function onDragLeave(e) {
      var dragLevel = this.state.dragLevel - 1;

      this.setState({ dragLevel: dragLevel });

      if (dragLevel === 0) {
        this.props.onDragLeave(e);
      }
    }
  }, {
    key: 'onDragOver',
    value: function onDragOver(e) {
      e.preventDefault();
      this.props.onDragOver(e);
    }
  }, {
    key: 'onFileDrop',
    value: function onFileDrop(e) {
      // eslint-disable-next-line no-param-reassign
      e = e || window.event;
      e.preventDefault();

      var files = [];

      if (!!e.dataTransfer) {
        var fileList = e.dataTransfer.files || [];

        for (var i = 0; i < fileList.length; i++) {
          fileList[i].id = _shortid2.default.generate();
          fileList[i].status = _status2.default.PENDING;
          fileList[i].progress = 0;
          fileList[i].src = null;
          files.push(fileList[i]);
        }
      }

      // reset drag level once dropped
      this.setState({ dragLevel: 0 });

      this.props.onFileDrop(e, files);
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          isOpen = _props.isOpen,
          customClass = _props.customClass,
          style = _props.style,
          children = _props.children;


      return isOpen ? _react2.default.createElement(
        'div',
        { className: (0, _classnames2.default)(customClass), style: style },
        children
      ) : null;
    }
  }]);

  return Receiver;
}(_react.Component);

Receiver.propTypes = {
  children: _react.PropTypes.oneOfType([_react.PropTypes.element, _react.PropTypes.arrayOf(_react.PropTypes.element)]),
  customClass: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.arrayOf(_react.PropTypes.string)]),
  isOpen: _react.PropTypes.bool.isRequired,
  onDragEnter: _react.PropTypes.func.isRequired,
  onDragOver: _react.PropTypes.func,
  onDragLeave: _react.PropTypes.func.isRequired,
  onFileDrop: _react.PropTypes.func.isRequired,
  style: _react.PropTypes.object
};

exports.default = Receiver;