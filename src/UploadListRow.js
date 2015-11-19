import React, { Component } from 'react';
import invariant from 'invariant';
import status from './constants/status';

class UploadListRow extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        invariant(
            window.FileReader,
            'Your browser does not support FileReader. Please try again with an evergreen browser.'
        );
    }

    componentDidMount() {
        let { file, upload } = this.props;

        if (file.status === status.PENDING) {
            let reader = new FileReader();
            reader.readAsDataURL(file);

            reader.on('error', (e) => {
                file.status === status.FAILED;
            });

            reader.on('loadstart', (e) => {
                file.status === status.LOADING;
            });

            reader.on('loadend', (e, file) => {
                upload(file);
            });
        }
    }

    render() {
        let { file } = this.props;

        return (
            <li>
                <dl>
                    <dh>{ file.name }</dh>
                    <dd>file details: progress, type, icon, etc</dd>
                </dl>
            </li>
        )
    }
}

export default UploadListRow;