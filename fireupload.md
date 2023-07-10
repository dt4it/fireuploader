# FireUploader

This is a simple image upload form with preview using the FireUploader script.


This is a simple image upload form with preview using the FireUploader script.

## Features

- Drag and drop files to upload
- Preview uploaded images
- Remove uploaded images
- Zoom in on images
- Sort and rearrange images
- Supports multiple file uploads
- Restrict file types and extensions


## Getting Started

To get started with the image upload form, follow the instructions below.

### Prerequisites

- [Bootstrap 4](https://getbootstrap.com/)
- [Font Awesome](https://fontawesome.com/)
- [AdminLTE 3](https://adminlte.io/themes/v3/)


###  License
This project is licensed under the MIT License.

Note: This README assumes that you have included the necessary dependencies and files in your project. Make sure to replace upload.php with your actual server-side script that handles file uploads.

For more information on using the FireUploader script, refer to the fireupload.js

### Installation

1. Include the necessary CSS files in your HTML file:

```html
<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
<link rel="stylesheet" href="fireupload.css">

Add the HTML structure for the image upload form:
<form action="upload.php" method="post" enctype="multipart/form-data">
    <div class="fireupload" id="dropzone1"></div>
    <div class="fireupload" id="dropzone2"></div>
    <button type="submit" class="btn btn-primary">Submit</button>
</form>

Include the necessary JavaScript files at the bottom of your HTML file:
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://unpkg.com/sortablejs@1.13.0/Sortable.min.js"></script>
<script src="fireupload.js"></script>

Initialize the FireUploader script with your desired configuration:

$(document).ready(function () {
    var files_arr = {
        files: [
            {
                size: 1020.5185546875,
                type: 'image/png',
                order: 1,
                thumbs: [],
                is_image: 1,
                raw_name: '1688479052_6d4345532eaf0cba30d1.png',
                dimension: '144*0710',
                extension: 'png',
                full_path: 'images/01.png',
                original_name: '01.png',
            },
            {
                size: 1020.5185546875,
                type: 'image/png',
                order: 2,
                thumbs: [],
                is_image: 1,
                raw_name: '1688479052_6d4345532eaf0cba30d1.png',
                dimension: '144*0710',
                extension: 'png',
                full_path: 'images/02.png',
                original_name: '02.png',
            },
            {
                size: 14.388671875,
                type: 'image/jpeg',
                order: 3,
                thumbs: [],
                is_image: 1,
                raw_name: '1688479052_eee6c3ad57ecd0597b46.jpg',
                dimension: '750*422',
                extension: 'jpg',
                full_path: 'images/dart.jpg',
                original_name: 'dart.jpg',
            },
        ],
        fileCount: 2,
    };
    var uploader1 = new FireUploader({
        dropzoneId: 'dropzone1',
        inputName: "test1[]",
        multipleFiles: true,
        allowedExtensions: ["jpg", "png", "gif","txt","pdf","mp4"],
        files: files_arr
    });

    var uploader2 = new FireUploader({
        dropzoneId: 'dropzone2',
        inputName: "test2[]",
        allowedExtensions: ["txt","pdf", "docx","doc","xlsx","mp4","zip"],
        multipleFiles: false
    });
});
