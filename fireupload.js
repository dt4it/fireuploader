class FireUploader {
    constructor({dropzoneId, inputName = 'file', multipleFiles = false, files = {files: [], fileCount: 0}} = {}) {
        $(".fireupload").each((index, element) => {
            if ($(element).attr('id') === dropzoneId) {
                this.setUpInstance(element, inputName, multipleFiles, files);
            }
        });
    }

    setUpInstance(element, inputName, multipleFiles, files) {
        this.initializeInstanceProperties(element, inputName, multipleFiles, files);
        this.init();
        this.handlePreloadedFiles();

        if (!this.multipleFiles) {
            this.$addIcon.addClass('hidden');
            this.$dropzone.find('.drag-drop-icon').hide();
        }
    }

    initializeInstanceProperties(element, inputName, multipleFiles, files) {
        this.$dropzone = $(element);
        this.$preview = this.createElementWithClass('div', 'preview').appendTo(this.$dropzone);
        this.$fileInput = this.createFileInputElement(inputName, multipleFiles).appendTo(this.$dropzone);
        this.$chooseFileLabel = this.createFileInputLabel().appendTo(this.$dropzone);
        this.$addIcon = this.createAddIconElement().appendTo(this.$dropzone);
        this.$dropzone.append(this.createDropzoneMessageElements());

        this.files = files;
        this.multipleFiles = multipleFiles;
    }

    createElementWithClass(elementType, className) {
        return $('<' + elementType + '>', {class: className});
    }

    createFileInputElement(inputName, multipleFiles) {
        const fileInputElementId = 'fileInput' + this.$dropzone.attr('id');
        return $('<input>', {
            type: 'file',
            name: inputName,
            class: 'choose-file-input',
            multiple: multipleFiles,
            id: fileInputElementId
        });
    }

    createFileInputLabel() {
        const labelFor = 'fileInput' + this.$dropzone.attr('id');
        return $('<label>', {
            for: labelFor,
            class: 'choose-file-label'
        }).html('<i class="fas fa-upload"></i>Choose Files');
    }

    createAddIconElement() {
        return $('<div>', {class: 'add-icon hidden'}).html('<i class="fas fa-plus"></i>');
    }

    createDropzoneMessageElements() {
        return [$('<p>').text('Drag and drop files here'), $('<p>').text('Or'), this.$chooseFileLabel, this.$fileInput, this.$addIcon];
    }

    init() {
        this.$dropzone.on('dragover', (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.$dropzone.addClass('dragover');
        });

        this.$dropzone.on('dragenter', (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.$dropzone.addClass('dragover');
        });

        this.$dropzone.on('dragleave', (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.$dropzone.removeClass('dragover');
        });

        this.$dropzone.on('drop', (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.$dropzone.removeClass('dragover');

            const droppedFiles = event.originalEvent.dataTransfer.files;
            if (!this.multipleFiles) {
                this.$preview.empty(); // Clear existing preview items when replacing files
            }
            this.handleFiles(droppedFiles);
        });

        const fileInput = this.$dropzone.find('.choose-file-input');
        fileInput.on('change', (event) => {
            if (!this.multipleFiles) {
                this.$preview.empty(); // Clear existing preview items when replacing files
            }
            this.handleFiles(event.target.files);
        });

        const addIcon = this.$dropzone.find('.add-icon');
        addIcon.on('click', () => {
            fileInput.click();
        });

        if (this.multipleFiles) {
            Sortable.create(this.$preview[0], {
                handle: '.drag-drop-icon',
                animation: 150,
                onEnd: (event) => {
                    const item = event.item;
                    const newIndex = event.newIndex;
                    const oldIndex = event.oldIndex;
                    const filename = item.getAttribute('data-filename');

                    // Move the file in the this.files.files array
                    const movedFile = this.files.files.splice(oldIndex, 1)[0];
                    this.files.files.splice(newIndex, 0, movedFile);

                    // Update the order property of each file
                    this.files.files.forEach((file, index) => {
                        file.order = index + 1;
                    });

                    // Update the hidden inputs with the new file values
                    this.$preview.find('.preview-item').each((index, previewItem) => {
                        const $previewItem = $(previewItem);
                        const $hiddenInput = $previewItem.find('.hidden-file-input');
                        $hiddenInput.val(JSON.stringify(this.files.files[index]));
                    });
                }
            });
        }

        this.$preview.on('click', '.preview-item', (event) => {
            const $target = $(event.target).closest('.preview-item');
            const index = $target.index();
            this.showZoomPopup(index);
        });
    }

    showZoomPopup(index) {
        const $popup = $('.zoom-popup'); // Get the existing zoom popup if it exists
        if ($popup.length > 0) {
            $popup.remove(); // Remove any existing zoom popups
        }

        const $zoomedImg = $('<img>', {
            class: 'zoomed-image',
            src: '',
        });
        const $closeIcon = $('<span>', {
            class: 'close-icon',
            html: '&times;',
        });
        const $prevIcon = $('<span>', {
            class: 'nav-icon prev-icon',
            html: '<i class="fas fa-chevron-left"></i>',
        });
        const $nextIcon = $('<span>', {
            class: 'nav-icon next-icon',
            html: '<i class="fas fa-chevron-right"></i>',
        });

        const $newPopup = $('<div>', {class: 'zoom-popup'});
        $newPopup.append($zoomedImg);
        $newPopup.append($closeIcon);
        $newPopup.append($prevIcon);
        $newPopup.append($nextIcon);
        $newPopup.appendTo('body');

        const $previewItems = this.$preview.find('.preview-item');
        const totalItems = $previewItems.length;

        $zoomedImg.addClass('active-image'); // Add an active class to the initial image

        $prevIcon.on('click', () => {
            $('.active-image').removeClass('active-image'); // Remove active class from all images
            $zoomedImg.attr('src', ''); // Clear current image
            index = (index - 1 + totalItems) % totalItems;
            const $currentItem = $previewItems.eq(index);
            const currentDataUrl = $currentItem.find('img').attr('src');
            $zoomedImg.attr('src', currentDataUrl);
            $zoomedImg.addClass('active-image'); // Add active class to the new image
        });

        $nextIcon.on('click', () => {
            $('.active-image').removeClass('active-image'); // Remove active class from all images
            $zoomedImg.attr('src', ''); // Clear current image
            index = (index + 1) % totalItems;
            const $currentItem = $previewItems.eq(index);
            const currentDataUrl = $currentItem.find('img').attr('src');
            $zoomedImg.attr('src', currentDataUrl);
            $zoomedImg.addClass('active-image'); // Add active class to the new image
        });

        $closeIcon.on('click', function (event) {
            event.stopPropagation(); // Prevent the event from bubbling up to other elements
            $('.zoom-popup').remove(); // Remove the entire popup
            console.log('Close icon clicked'); // Log the click event
        });

        // Set the initial image
        const $currentItem = $previewItems.eq(index);
        const initialDataUrl = $currentItem.find('img').attr('src');
        $zoomedImg.attr('src', initialDataUrl);
    }

    handleFiles(selectedFiles) {
        $.each(selectedFiles, (index, file) => {
            if (file.type.match('image.*')) {
                // Check if the file is already in the array
                if (this.files.files.some(existingFile => existingFile.raw_name === file.name)) {
                    console.log(`The file ${file.name} already exists.`);
                } else {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        // Create an image to get the dimensions
                        const img = new Image();
                        img.onload = () => {
                            const newFile = {
                                size: (file.size / 1024).toFixed(3), // size of the file in kilobytes, rounded to three decimal places
                                type: file.type, // MIME type of the file
                                order: this.files.files.length + 1, // order of the file (assumes files array only contains current files)
                                thumbs: [], // empty by default
                                is_image: file.type.startsWith('image/') ? 1 : 0, // 1 if the file is an image, 0 if not
                                raw_name: file.name, // raw name of the file
                                dimension: img.width + '*' + img.height, // dimensions of the image, format: width*height
                                extension: file.name.split('.').pop(), // file extension
                                full_path: '', // by default empty because the added image is not uploaded yet
                                original_name: file.name // the original name of the file
                            };

                            this.files.files.push(newFile);

                            this.addPreviewItem({
                                dataUrl: event.target.result,
                                name: file.name,
                                fileObject: newFile // pass the new file object to the function
                            });
                        };
                        img.src = event.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            }
        });
    }

    handlePreloadedFiles() {
        if (this.files.fileCount > 0) {
            $.each(this.files.files, (index, file) => {
                this.addPreviewItem({
                    dataUrl: file.full_path,
                    name: file.original_name,
                    fileObject: file // pass the file object from preloaded files
                });
            });
        }
    }

    addPreviewItem(fileData) {
        const img = $('<img>', {
            src: fileData.dataUrl,
            alt: fileData.name,
        });

        const div = $('<div>', {
            class: 'preview-item',
            'data-filename': fileData.name,
        });

        const iconsDiv = $('<div>', {class: 'icons'});
        const removeIcon = $('<span>', {
            class: 'remove-icon',
            html: '<i class="fas fa-trash"></i>',
        });
        const zoomIcon = $('<span>', {
            class: 'zoom-icon',
            html: '<i class="fas fa-search-plus"></i>',
        });
        const dragDropIcon = $('<span>', {
            class: 'drag-drop-icon',
            html: '<i class="fas fa-arrows-alt"></i>',
        });

        iconsDiv.append(removeIcon);
        iconsDiv.append(zoomIcon);
        iconsDiv.append(dragDropIcon);

        div.append(img);
        div.append(iconsDiv);

        // Create the hidden file input
        const hiddenFileInput = $('<input>', {
            type: 'hidden',
            name: this.$fileInput.attr('name'),
            value: JSON.stringify(fileData.fileObject), // set the value to the corresponding file object
            class: 'hidden-file-input'
        }).appendTo(div);

        this.$preview.append(div);

        removeIcon.on('click', () => {
            div.remove();
            // Remove the file from the files array
            this.files.files = this.files.files.filter(file => file.original_name !== fileData.name);
            // Check if there are no previewed images to show the add icon
            if (this.$preview.find('.preview-item').length === 0) {
                this.$addIcon.removeClass('hidden');
            }
        });


        zoomIcon.on('click', (event) => {

            const $popup = $('<div>', {class: 'zoom-popup'});
            const $zoomedImg = $('<img>', {
                class: 'zoomed-image',
                src: fileData.dataUrl,
            });
            const $closeIcon = $('<span>', {
                class: 'close-icon',
                html: '&times;',
            });
            const $prevIcon = $('<span>', {
                class: 'nav-icon prev-icon',
                html: '<i class="fas fa-chevron-left"></i>',
            });
            const $nextIcon = $('<span>', {
                class: 'nav-icon next-icon',
                html: '<i class="fas fa-chevron-right"></i>',
            });

            $popup.append($zoomedImg);
            $popup.append($closeIcon);
            $popup.append($prevIcon);
            $popup.append($nextIcon);
            $popup.appendTo('body');

            $closeIcon.on('click', function () {
                $popup.remove();
            });

            $prevIcon.on('click', () => {
                const currentIndex = this.$preview.find('.preview-item').index(div);
                if (currentIndex > 0) {
                    const $prevItem = this.$preview.find('.preview-item').eq(currentIndex - 1);
                    const prevDataUrl = $prevItem.find('img').attr('src');
                    $zoomedImg.attr('src', prevDataUrl);
                }
            });

            $nextIcon.on('click', () => {
                const currentIndex = this.$preview.find('.preview-item').index(div);
                if (currentIndex < this.$preview.find('.preview-item').length - 1) {
                    const $nextItem = this.$preview.find('.preview-item').eq(currentIndex + 1);
                    const nextDataUrl = $nextItem.find('img').attr('src');
                    $zoomedImg.attr('src', nextDataUrl);
                }
            });
        });

        // Move the add-icon after the last previewed image
        if (this.$preview.find('.preview-item').length > 1 || !this.multipleFiles) {
            this.$addIcon.appendTo(this.$preview);
            this.$addIcon.removeClass('hidden');
        } else {
            this.$addIcon.addClass('hidden');
        }


    }
}
