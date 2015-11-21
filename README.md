# react-file-upload

react-file-upload is a set of components written in React.js which helps you to upload file easily.

### Installation

To install:

```
npm install --save react-file-upload
```

### Documentation

this module currently contains 4 major entities, which are

1. Receiver
2. UploadManager
3. UploadHandler
4. File Status

### Receiver

Receiver helps you to manage file upload triggered by **_Drag and Drop_**. Once you mounted the **Receiver** component, the **_Drag and Drop_** function will be enabled.

#### Props

##### customClass `string | array`

the class name(s) for the `div` wrapper

##### style `object`

the style for the `div` wrapper 

##### isOpen `boolean` `required`

it enables you to control in the parent component whether the Receiver is opened.

##### onDragEnter `function` `required`

this will be fired with the window event of `onDragEnter` once only when `isOpen` is `false`.

##### onDragOver `function`

this will be fired with the window event of `onDragOver`.

##### onDragLeave `function` `required`

this will be fired with the window event of `onDragLeave` once only when the drag event entirely left the client (i.e. `dragLevel` == 0).

##### onFileDrop `function` `required`

this will be fired with the window event of `drop`. You may execute any validation / checking process here i.e. *size*, *file type*, etc.

###### Arguments

1. target *(Object)*: the target node of the drop event
2. files *(Array)*: the files dropped on the target node

### UploadManager

Upload Manager serves as a high order component which helps you to manage the upload related parameters and functions. It prepares the upload logic with [`superagent`](https://github.com/visionmedia/superagent) for the `UploadHandler` as its children, and helps you to update the lifecycle status of the uploading files.

#### Props

##### customClass `string | array`

the class name(s) for the `div` wrapper

##### style `object`

the style for the `div` wrapper 

##### files `array`

the array of files object that are **_uploaded / going to be uploaded_** to be shown in the file list.

##### uploadUrl `string` `required`

the url of the upload end point from your server.

##### onUploadStart `function`

this will be fired when the `POST` request is just sent.

###### Arguments

1. file *(Object)*: the file object returned with `UPLOADING` status and `0%` progress.

##### onUploadProgress `function`

this will be fired when the `POST` request returns progress.

###### Arguments

1. file *(Object)*: the file object returned with `UPLOADING` status and `n%` progress.

##### onUploadEnd `function` `required`

this will be fired upon the end of `POST` request.

###### Arguments

1. file *(Object)*: the file object returned with either `UPLOADED` status and `100%` progress or `FAILED` status, `0%` progress and error reason.

### UploadHandler

Upload Handler helps you to execute the upload lifecycle, which is `start`, `progress` and `end`. It also acts as the presentation layer of a file, showing users the info of the **_uploading / uploaded_** file.

#### Props

##### customClass `string | array`

the class name(s) for the `div` wrapper

##### style `object`

the style for the `div` wrapper 

##### file `object` `required`

the file object that is **_uploaded / going to be uploaded_**.

##### upload `function`

the function that contains the upload logic, you may pass it directly when you are using `UploadHandler` alone, or it could be prepared by `UploadManager`.

##### autoStart `boolean`

When `autoStart` is set to `true`, upon the UploadHandler component did mount, it will detect if the file i.e. *as props* is with the `PENDING` status and initialise a `POST` request which is sent to the `uploadUrl` you passed to the `UploadManager`.

### File Status

this module defines a set of status constants to represent the file status. The corresponding status will be assign to a file object throughout the uploading life cycle.

```
FAILED = -1
PEDNING = 0
UPLOADING = 1
UPLOADED = 2
```

### License

MIT