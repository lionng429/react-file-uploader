import React, { Component, PropTypes } from 'react';
import invariant from 'invariant';
import UploadListRow from './UploadListRow';

class UploadList extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let { files, onUploadDone, onUploadError } = this.props;

        return (
            <div className={classNames(customClass)} ref="upload-list" style={style}>
                <h2>Upload List</h2>
                <ul>
                    {
                        files.map((file, index) => {
                            return (
                                <li key={index}>
                                    <UploadListRow
                                        file={file}
                                        upload={upload}
                                        onUploadDone={onUploadDone} />
                                </li>
                            );
                        })
                    }
                </ul>
            </div>
        );
    }
}

UploadList.propTypes = {
    files: PropTypes.array,
    customClass: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string)
    ]),
    style: PropTypes.object,
    upload: PropTypes.func.isRequired,
    onUploadDone: PropTypes.func.isRequired
};

export default UploadList;