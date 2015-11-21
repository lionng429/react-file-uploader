import React, { Component, PropTypes } from 'react';
import invariant from 'invariant';
import classNames from 'classnames';
import { suid } from 'rand-token';
import status from './constants/status';

class Receiver extends Component {
    constructor(props) {
        super(props);

        this.onDragEnter = this.onDragEnter.bind(this);
        this.onDragOver = this.onDragOver.bind(this);
        this.onDragLeave = this.onDragLeave.bind(this);
        this.onFileDrop = this.onFileDrop.bind(this);

        this.state = {
            dragLevel: 0
        }
    }

    componentWillMount() {
        invariant(
            window.FileReader,
            'Your browser does not support drag and drop. Please try again with an evergreen browser.'
        );
    }

    componentDidMount() {
        let { openPanel, closePanel, onDragOver } = this.props;
        window.addEventListener('dragenter', this.onDragEnter);
        window.addEventListener('dragleave', this.onDragLeave);
        window.addEventListener('dragover', this.onDragOver);
        window.addEventListener('drop', this.onFileDrop);
    }

    componentWillUnmount() {
        let { openPanel, closePanel, onDragOver } = this.props;
        window.removeEventListener('dragenter', this.onDragEnter);
        window.removeEventListener('dragleave', this.onDragLeave);
        window.removeEventListener('dragover', this.onDragOver);
        window.removeEventListener('drop', this.onFileDrop);
    }

    onDragEnter(e) {
        this.setState({
            dragLevel: this.state.dragLevel + 1
        });

        if (!this.props.isOpen) {
            return this.props.onDragEnter();
        }
    }

    onDragLeave(e) {
        let dragLevel = this.state.dragLevel - 1;

        this.setState({ dragLevel });

        if (dragLevel == 0) {
            return this.props.onDragLeave();
        }
    }

    onDragOver(e) {
        e.preventDefault && e.preventDefault();
        return typeof this.props.onDragOver === 'function' && this.props.onDragOver(e);
    }

    onFileDrop(e) {
        e = e || window.event;
        e.preventDefault && e.preventDefault();

        let fileList = e.dataTransfer.files;
        let files = [];

        for (let i = 0; i < fileList.length; i ++) {
            fileList[i].id = suid(4);
            fileList[i].status = status.PENDING;
            fileList[i].progress = 0;
            fileList[i].src = null;
            files.push(fileList[i]);
        }

        // reset drag level once dropped
        this.setState({ dragLevel: 0 });

        return this.props.onFileDrop(e.target, files);
    }

    render() {
        let { isOpen, customClass, style, children } = this.props;

        return (
            !isOpen ? null :
            <div className={classNames(customClass)} style={style}>
                { children }
            </div>
        )
    }
}

Receiver.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    customClass: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string)
    ]),
    style: PropTypes.object,
    onDragEnter: PropTypes.func.isRequired,
    onDragOver: PropTypes.func,
    onDragLeave: PropTypes.func.isRequired,
    onFileDrop: PropTypes.func.isRequired
};

export default Receiver;