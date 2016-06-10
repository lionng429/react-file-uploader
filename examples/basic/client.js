var React = require('react');
var ReactDOM = require('react-dom');
var FileUploader = require('../../lib');
var _ = require('lodash');

var MyComponent = React.createClass({
    getInitialState: function() {
        return {
            isPanelOpen: false,
            isDragOver: false,
            files: []
        }
    },

    openPanel: function() {
        this.setState({ isPanelOpen: true });
    },

    closePanel: function() {
        this.setState({ isPanelOpen: false });
    },

    onDragOver: function(e) {
        // your codes here:
        // if you want to check if the files are dragged over
        // a specific DOM node
        //if (e.target === node) {
        //    this.setState({
        //        isDragOver: true
        //    });
        //}
    },

    onFileDrop: function({ target }, files) {
        let node = ReactDOM.findDOMNode(this.refs.uploadPanel);
        if (target != node) {
            return false;
        }

        files.map(function(_file) {
            if (_file.size > 1000 * 1000) {
                _file.status = FileUploader.status.FAILED;
                _file.error = 'file size exceeded maximum'
            }
        });

        this.setState({
            files: this.state.files.concat(files)
        });

        // if you want to close the panel upon file drop
        this.closePanel();
    },

    onFileProgress: function(file) {
    var files = this.state.files;

    files.map(function(_file) {
        if (_file.id === file.id) {
            _file = file;
        }
    });

    this.setState({
        files: files
    });
},

    onFileUpdate: function(file) {
        var files = this.state.files;

        files.map(function(_file) {
            if (_file.id === file.id) {
                _file = file;
            }
        });

        this.setState({
            files: files
        });
    },

    _getStatusString: function(status) {
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
    },

    render: function() {
        var _this = this;

        return (
            <div>
                <h1>{ this.props.title }</h1>
                <p>You can upload files with size with 1 MB at maximum</p>
                <FileUploader.Receiver
                    ref="uploadPanel"
                    customClass="upload-panel"
                    isOpen={this.state.isPanelOpen}
                    onDragEnter={this.openPanel}
                    onDragOver={this.onDragOver}
                    onDragLeave={this.closePanel}
                    onFileDrop={this.onFileDrop} >
                    <p>
                        {
                            !this.state.isDragOver ? 'Drop here' : 'Files detected'
                        }
                    </p>
                </FileUploader.Receiver>
                <div>
                    <p>Upload List</p>
                    <FileUploader.UploadManager
                        customClass="upload-list"
                        files={this.state.files}
                        uploadUrl="/upload"
                        onUploadStart={this.onFileUpdate}
                        onUploadProgress={_.debounce(this.onFileProgress, 150)}
                        onUploadEnd={this.onFileUpdate}
                    >
                        {
                            this.state.files.map(function(file, index) {
                                return (
                                    <FileUploader.UploadHandler key={index} file={file} autoStart={true}>
                                        <dl>
                                            <dh>{ file.name }</dh>
                                            <dd>
                                                <span className="file__id">{ file.id } </span>
                                                <span className="file__type">{ file.type } </span>
                                                <span className="file__size">{ file.size / 1000 / 1000 } MB</span>
                                                <span className="file__progress">{ file.progress }%</span>
                                                <span className="file__status">
                                                    {_this._getStatusString(file.status)}
                                                </span>
                                                <span className="file__error">{ file.error }</span>
                                            </dd>
                                        </dl>
                                    </FileUploader.UploadHandler>
                                )
                            })
                        }
                    </FileUploader.UploadManager>
                </div>
            </div>
        );
    }
});

ReactDOM.render(<MyComponent title="react-file-uploader" />, document.getElementById('app'));