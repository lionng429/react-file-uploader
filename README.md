# react-file-uploader

react-file-uploader is a set of highly customizable React components that helps you to build a file uploader in your application easily. 

react-file-uploader is not production ready because it is not fully tested on all browsers, and the unit test coverage is just not good enough. However, it has been used in my cms project since v0.3.0.

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
function onFileDrop(e, files) {
	// check if the files are drop on the targeted DOM
	const node = ReactDOM.findDOMNode(this.refs.uploadPanel);
	if (e.target !== node) {
		return;
	}
	
	files.forEach(file => {
		// check file size
		if (file.size > 1000 * 1000) {
			file.error = 'file size exceeded 1MB';
		}
	})
	
	// put files into state/stores by setState/action
	this.setState({
		files: this.state.files.concat(files),
	});
	
	// close the Receiver after file dropped
	this.setState({ isReceiverOpen: false });
}
```

# UploadManager

Upload Manager serves as a high order component which helps you to manage the upload related parameters and functions. It prepares the upload function with [`superagent`](https://github.com/visionmedia/superagent) the children elements, and helps you to update the lifecycle status of the uploading files.

**_IMPORTANT: this high order component serves only for_ ** `UploadHandler`

```
import { UploadManager } from 'react-file-uploader';

<UploadManager
  customClass={STRING_OR_ARRAY}
  style={OBJECT}
  uploadUrl={STRING}
  uploadHeader={OBJECT}
  onUpload={FUNCTION}
  onUploadProgress={FUNCTION}
  onUploadEnd={FUNCTION}
>
	
	// UploadHandler as children
	files.map(file => (
		<UploadHandle key={file._id} file={FILE_INSTANCE} autoStart={BOOLEAN} />
	))
</UploadManager>
```

## Props

* component - `string`: the DOM tag name of the wrapper
* customClass - `string | array`: the class name(s) for the wrapper
* style - `object`: the style for the wrapper
* uploadUrl - `string` `required`: the url of the upload end point from your server.
* uploadHeader - `object`: the header object to be set as request header.
* onUploadStart - `function`: this will be fired when the `POST` request is just sent.

```
// @param file Object the file object returned with UPLOADING status and 0% progress.
function onUploadStart(file) {
	// your codes here
}
```

* onUploadProgress - `function`: this will be fired when the `POST` request returns progress. A debounced function is **STRONGLY** recommaned to prevent from performance issue.

```
// @param file Object the file object returned with UPLOADING status and n% progress.
function onUploadProgress(file) {
	// your codes here
}
```

* onUploadEnd - `function` `required`: this will be fired upon the end of `POST` request.

```
// @param file Object the file object returned with either UPLOADED or FAILED status and 100% progress. When it is wilh FAILED status, error property should be also assigned to the file object.
function onUploadEnd(file) {
	// your codes here
}
```

* errorHandler - `function`: this function is to process the arguments of `(err, res)` in `superagent.end()`. In this function, you can resolve the error and result according to your upload api response. Default implementation is available as defaultProps.

```
function errorHandler(err, res) {
  let error = null;
  const body = clone(res.body);

  if (err) {
  	error = err;
  } else if (body && body.errors) {
    error = body.errors;
  }
  
  delete body.errors;
  
  return { error, result: body };
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
/>
```

## Props

* `component` - `string`: the DOM tag name of the wrapper
* `customClass` - `string | array`: the class name(s) for the wrapper
* `style` - `object`: the style for the wrapper 
* `file` - `object` `required`: the file object that is **_uploaded / going to be uploaded_**.
* `autoStart` - `boolean`: when `autoStart` is set to `true`, upon the UploadHandler component did mount, it will detect if the file i.e. *as props* is with the `PENDING` status and initialise a `POST` request which is sent to the `uploadUrl` you passed to the `UploadManager`.
* `upload` - `function`: the function that contains the upload logic, you may pass it directly when you are using `UploadHandler` alone, or it could be prepared by `UploadManager`.

 
```
// @param url String API upload end point
// @param file Object File Object
function upload(url, file) {
	// your codes here
}
```

# File Status

`react-file-uploader` defines a set of status constants to represent the file status. The corresponding status will be assign to a file object throughout the uploading life cycle.

```
FAILED = -1
PENDING = 0
UPLOADING = 1
UPLOADED = 2
```

# TODOs

* complete test cases
* add real-world example
* support optional data, i.e. custom image name and destination

# License

MIT