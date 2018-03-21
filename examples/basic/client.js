import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
var FileUploader = require('react-file-uploader');

class MyComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isPanelOpen: false,
      isDragOver: false,
      files: [],
    };

    this.uploadPanel = undefined;
  }

  openPanel = () => {
    this.setState({ isPanelOpen: true });
  }

  closePanel = () => {
    this.setState({ isPanelOpen: false });
  }

  onDragOver = (e) => {
    // your codes here:
    // if you want to check if the files are dragged over
    // a specific DOM node
    const node = ReactDOM.findDOMNode(this.uploadPanel);

    this.setState({
      isDragOver: e.target === node,
    });
  }

  onFileDrop = ({ target }, files) => {
    const node = ReactDOM.findDOMNode(this.uploadPanel);

    if (target !== node) {
      this.closePanel();
      return false;
    }

    files.forEach(item => {
      if (item.size > 1000 * 1000) {
        item.status = FileUploader.status.FAILED;
        item.error = 'file size exceeded maximum';
      }
    });

    this.setState({
      files: this.state.files.concat(files),
    });

    // if you want to close the panel upon file drop
    this.closePanel();
  }

  onFileProgress = (file) => {
    const { files = [] } = this.state;
    const newFiles = files.map(item => item.id === file.id ? file : item);

    this.setState({
      files: newFiles,
    });
  }

  onFileUpdate = (file) => {
    const { files = [] } = this.state;
    const newFiles = files.map(item => item.id === file.id ? file : item);

    this.setState({
      files: newFiles,
    });
  }

  setUploadPanelRef = (ref) => {
    this.uploadPanel = ref;
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
    return (
      <div>
        <h1>{ this.props.title }</h1>
        <p>You can upload files with size with 1 MB at maximum</p>
        <FileUploader.Receiver
          ref={this.setUploadPanelRef}
          customClass="upload-panel"
          isOpen={this.state.isPanelOpen}
          onDragEnter={this.openPanel}
          onDragOver={this.onDragOver}
          onDragLeave={this.closePanel}
          onFileDrop={this.onFileDrop}
        >
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
              this.state.files.map((file, index) => (
                <FileUploader.UploadHandler key={index} file={file} autoStart>
                  <dl>
                    <dh>{file.name}</dh>
                    <dd>
                      <span className="file__id">{file.id} </span>
                      <span className="file__type">{file.type} </span>
                      <span className="file__size">{file.size / 1000 / 1000} MB</span>
                      <span className="file__progress">{file.progress}%</span>
                      <span className="file__status">
                        {this.getStatusString(file.status)}
                      </span>
                      <span className="file__error">{file.error}</span>
                    </dd>
                  </dl>
                </FileUploader.UploadHandler>
              ))
            }
          </FileUploader.UploadManager>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<MyComponent title="react-file-uploader" />, document.getElementById('app'));
