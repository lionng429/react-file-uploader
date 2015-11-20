import React, { Component, PropTypes } from 'react';
import invariant from 'invariant';
import classNames from 'classnames';
import status from './constants/status';

class UploadPanel extends Component {
    constructor(props) {
        super(props);

        this.onFileDrop = this.onFileDrop.bind(this);

        this.state = {
            isDragOver: false,
            files: {}
        }
    }

    componentWillMount() {
        invariant(
            window.FileReader,
            'Your browser does not support drag and drop. Please try again with an evergreen browser.'
        );
    }

    componentDidMount() {
        let { onDragOver, onFileDrop } = this.props;

        if (window.FileReader) {
            window.addEventListener('dragover', onDragOver);
            window.addEventListener('drop', this.onFileDrop);
        }
    }

    componentWillUnmount() {
        if (window.FileReader) {
            window.removeEventListener('dragover', onDragOver);
            window.removeEventListener('drop', this.onFileDrop);
        }
    }

    onFileDrop(e) {
        e = e || window.event;
        e.preventDefault && e.preventDefault();

        let fileList = e.dataTransfer.files;
        let files = [];

        for (let i = 0; i < fileList.length; i ++) {
            let file = _.assign(fileList[i], { status: status.PENDING });
            files.push(file);
        }

        return this.props.onFileDrop(files);
    }

    render() {
        let { isOpen, customClass, style } = this.props;

        if (!isOpen) {
            return null;
        }

        return (
            <div className={classNames(customClass)} ref="upload-panel" style={style}>
                {
                    this.state.isDragOver ?
                        <div>Files Detected</div> :
                        <div>Drop Here</div>
                }
            </div>
        )
    }
}

UploadPanel.propTypes = {
    isOpen: PropTypes.bool,
    customClass: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string)
    ]),
    style: PropTypes.object,
    onDragOver: PropTypes.func.isRequired,
    onFileDrop: PropTypes.func.isRequired,
};

export default UploadPanel;