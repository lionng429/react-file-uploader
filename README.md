# react-file-uploader

react-file-uploader is a set of customizable React components that helps you to build a file uploader in your application easily.

It is expected to be production ready from v1.0.0, although v0.4.1 provides a stable but very simple and limited usage.

The uploading implementation is coupled with [superagent](https://visionmedia.github.io/superagent/), and the `method`, `header` and `data` are configurable with props.

## Installation

To install:

```sh
npm install --save react-file-uploader
```

# Documentation

this module currently contains 4 major entities, which are

1. Receiver
2. UploadManager
3. UploadHandler
4. File Status

# Receiver

`Receiver` helps you to manage the **Drag and Drop** functionality. Once you mounted the `Receiver` component, your application will start listen to `dragenter`, `dragover`, `dragleave` and `drop` events.

```
import { Receiver } from 'react-file-uploader';

<Receiver
  wrapperId={STRING}
  customClass={STRING_OR_ARRAY}
  style={OBJECT}
  isOpen={BOOLEAN}
  onDragEnter={FUNCTION}
  onDragOver={FUNCTION}
  onDragLeave={FUNCTION}
  onFileDrop={FUNCTION}
>
  <div>
    visual layer of the receiver (drag & drop panel)
  </div>
</Receiver>
```

## Props

* wrapperId - `string`: Optional HTML element id for the DnD area. If not given, `window` will be used instead.
* customClass - `string | array`: the class name(s) for the `div` wrapper
* style - `object`: the style for the `div` wrapper 
* isOpen - `boolean` `required`: to control in the parent component whether the Receiver is visble.
* onDragEnter - `function` `required`: when `isOpen` is `false`, this will be fired with the window event of `dragenter` once .

You may make use of the drag & drop event callbacks.

```
// @param e Object DragEvent
function onDragEnter(e) {
	this.setState({ isReceiverOpen: true });
}
```

* onDragOver - `function`: this will be fired with the window event of `dragover`.

```
// @param e Object DragEvent
function onDragOver(e) {
	// your codes here
}
```

* onDragLeave - `function` `required`: when the drag event entirely left the client (i.e. `dragLevel === 0`), this will be fired with the window event of `dragleave` once.

```
// @param e Object DragEvent
function onDragLeave(e) {
	this.setState({ isReceiverOpen: false });
}
```

* onFileDrop - `function` `required`: this will be fired with the window event of `drop`. You may execute any validation / checking process here i.e. *size*, *file type*, etc.

```
// @param e Object DragEvent
// @param files Array the files dropped on the target node
function onFileDrop(e, uploads) {
	// check if the files are drop on the targeted DOM
	const node = ReactDOM.findDOMNode(this.refs.uploadPanel);
	if (e.target !== node) {
		return;
	}
	
	let newUploads = uploads.map(upload => {
		// check file size
		if (upload.data.size > 1000 * 1000) {
		  return Object.assign({}, upload, { error: 'file size exceeded 1MB' });
		}
	})
	
	// put files into state/stores by setState/action
	this.setState({
		uploads: this.state.uploads.concat(newUploads)),
	});
	
	// close the Receiver after file dropped
	this.setState({ isReceiverOpen: false });
}
```

# UploadManager

Upload Manager serves as a high order component which helps you to manage the upload related parameters and functions. It prepares the upload function with [`superagent`](https://github.com/visionmedia/superagent) the children elements, and helps you to update the lifecycle status of the uploading files.

```
import { UploadManager } from 'react-file-uploader';

<UploadManager
  component={STRING}
  customClass={STRING_OR_ARRAY}
  onUploadAbort={FUNCTION}
  onUploadStart={FUNCTION}
  onUploadProgress={FUNCTION}
  onUploadEnd={FUNCTION}
  progressDebounce={NUMBER}
  reqConfigs={OBJECT}
  style={OBJECT}
  uploadDataHandler={FUNCTION}
  uploadErrorHandler={FUNCTION}
  uploadHeaderHandler={FUNCTION}
	uploadUrl={STRING}
>
	// UploadHandler as children
	{
		files.map(file => (
			<UploadHandler key={file._id} file={FILE_INSTANCE} autoStart={BOOLEAN} />
		))
	}
</UploadManager>
```

## Props

* component - `string`: the DOM tag name of the wrapper. By default it is an unordered list `ul`.
* customClass - `string | array`: the class name(s) for the wrapper
* formDataParser - **DEPRECATED** this prop function is renamed as `uploadDataHandler` starting from v1.0.0.

* onUploadAbort - `function`: this will be fired when the upload request is aborted. This function is available from v1.0.0.

```
/**
 * @param fileId {string} identifier of a file / an upload task
 * @param changes {object} changes object containing the new property of an upload
 * @param changes.status {number} file status ABORTED
 */
let onUploadAbort = (fileId, { status }) => { ... }
```

* onUploadStart - `function`: this will be fired when the upload request is just sent.

```
/**
 * @param fileId {string} identifier of a file / an upload task
 * @param changes {object} changes object containing the new property of an upload
 * @param changes.status {number} file status UPLOADING
 */
let onUploadStart = (fileId, { status }) => { ... }
```

* onUploadProgress - `function`: this will be fired when the upload request returns progress. From v1.0.0, this callback is debounced for `props.progressDebounce` ms.

```
/**
 * @param fileId {string} identifier of a file / an upload task
 * @param changes {object} changes object containing the new property of an upload
 * @param changes.progress {number} upload progress in percentage
 * @param changes.status {number} file status UPLOADING
 */
let onUploadProgress = (fileId, { progress, status }) { ... }
```

* onUploadEnd - `function` `required`: this will be fired upon the end of upload request.

```
/**
 * @param fileId {string} identifier of a file / an upload task
 * @param changes {object} changes object containing the new property of an upload
 * @param changes.error {object} error returned from `props.uploadErrorHandler`
 * @param changes.progress {number} upload progress in percentage, either 0 or 100 with a corresponding FAILED or UPLOADED status
 * @param changes.result {object} upload result / response object returned from `props.uploadErrorHandler`
 * @param changes.status {number} file status, either FAILED or UPLOADED
 */
// @param file Object the file object returned with either UPLOADED or FAILED status and 100% progress. When it is wilh FAILED status, error property should be also assigned to the file object.
let onUploadEnd = (fileId, { error, progress, result, status }) => { ... }
```

* progressDebounce - `number`: debounce value in ms for the callback on superagent `progress`.
* reqConfigs - `object`: the exposed superagent configs including `accept`, `method`, `timeout` and `withCredentials`.
* style - `object`: the style property for the wrapper.
* uploadUrl - `string` `required`: the url of the upload end point from your server.
* uploadDataHandler - `function`: this function is to parse the data to be sent as request data. From v1.0.0, the first argument will become a upload task object instead of the File instance.

```
let uploadDataHandler = (upload) => {
	// for FormData
	const formData = new FormData();
	formData.append('file', upload.data);
	formData.append('custom-key', 'custom-value');
	return formData;

	// for AWS S3
	return upload.data;
}
```

* uploadErrorHandler - `function`: this function is to process the arguments of `(err, res)` in `superagent.end()`. In this function, you can resolve the error and result according to your upload api response. Default implementation is available as defaultProps.

```
function uploadErrorHandler(err, res) {
  const body = res.body ? clone(res.body) : {};
	let error = null;

	if (err) {
		error = err.message;
	} else if (body.errors) {
		error = body.errors;
	}

	delete body.errors;

	return { error, result: body };
}
```

* uploadHeader - **DEPRECATED** this prop is deprecated and replaced by `uploadHeaderHandler`.

* uploadHeaderHandler - `function`: the function is to parse the header object to be sent as request header.

```
let uploadHeaderHandler = (upload) => {
	// for AWS S3
	return {
		'Content-Type': upload.data.type,
		'Content-Disposition': 'inline'
	};
}
```

# UploadHandler

Upload Handler helps you to execute the upload lifecycle, which is `start`, `progress` and `end`. It also acts as the presentation layer of a file, showing users the info of the **_uploading / uploaded_** file.

```
import { UploadHandler } from 'react-file-uploader';

<UploadHandler
	customClass={CLASS_STRING_OR_ARRAY}
	style={STYLE_OBJECT}
	file={FILE_OBJECT}
	autoStart={BOOLEAN}
	upload={UPLOAD_FUNCTION}
>
	{
		// From v1.0.0, you can pass a render function as children, so to have access to the prepared `upload` and `abort` function.
		({ upload, abort }) => (
			<dl>
				<dt>{file.data.name}</dt>
				<dd>
					<span className="file__id">{file.id} </span>
					<span className="file__type">{file.data.type} </span>
					<span className="file__size">{file.data.size / 1000 / 1000} MB</span>
					<span className="file__progress">{file.progress}%</span>
					<span className="file__status">
						{this.getStatusString(file.status)}
					</span>
					<span className="file__error">{file.error}</span>
					{
						((index % 2 === 1 && file.status === 0) || file.status === -2) && (
							<button onClick={upload}>Upload</button>
						)
					}
					{
						file.status === 1 && (
							<button onClick={abort}>Abort</button>
						)
					}
				</dd>
			</dl>
		)
	}
</UploadHandler>
```

## Props

* `abort` - `function` the function to abort the upload request. It is provided by UploadManager HOC by default.
* `autoStart` - `boolean`: when `autoStart` is set, upon the UploadHandler `componentDidMount`, it will detect if the file i.e. *as props* is with the `PENDING` status and initialise an upload request which is sent to the `uploadUrl` you passed to the `UploadManager`.
* `component` - `string`: the DOM tag name of the wrapper.
* `customClass` - `string | array`: the class name(s) for the wrapper
* `style` - `object`: the style for the wrapper 
* `file` - `object` `required`: the file object that is **_uploaded / going to be uploaded_**.
* `upload` - `function`: the function that contains the upload logic, you may pass it directly when you are using `UploadHandler` alone, or it could be prepared by `UploadManager`.

```
// @param url String API upload end point
// @param file Object File Object
let upload = (url, file) => { ... }
```

# File Status

`react-file-uploader` defines a set of status constants to represent the file status. The corresponding status will be assign to a file object throughout the uploading life cycle.

```
ABORTED = -2
FAILED = -1
PENDING = 0
UPLOADING = 1
UPLOADED = 2
```

# TODOs

* complete test cases
* add real-world example
* verify and provide better support to Amazon Simple Storage Service

# License

MIT