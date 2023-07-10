class FireUploader {
    constructor({
                    dropzoneId,
                    inputName = 'file',
                    multipleFiles = false,
                    files = { files: [], fileCount: 0 },
                    allowedExtensions = []
                } = {}) {
        this.allowedExtensions = allowedExtensions;
        this.dropzoneId = dropzoneId;
        this.inputName = inputName;
        this.multipleFiles = multipleFiles;
        this.files = files;
        this.$dropzone = $(`#${dropzoneId}`);
        this.$preview = this.createElementWithClass('div', 'preview').appendTo(this.$dropzone);
        this.$fileInput = this.createFileInputElement(inputName, multipleFiles).appendTo(this.$dropzone);
        this.$chooseFileLabel = this.createFileInputLabel().appendTo(this.$dropzone);
        this.$addIcon = this.createAddIconElement().appendTo(this.$dropzone);
        this.$dropzone.append(this.createDropzoneMessageElements());
        this.init();
        this.handlePreloadedFiles();
    }

    createElementWithClass(elementType, className) {
        return $('<' + elementType + '>', { class: className });
    }

    createFileInputElement(inputName, multipleFiles) {
        const fileInputElementId = `fileInput${this.dropzoneId}`;
        return $('<input>', {
            type: 'file',
            name: inputName,
            class: 'choose-file-input',
            multiple: multipleFiles,
            id: fileInputElementId
        });
    }

    createFileInputLabel() {
        const labelFor = `fileInput${this.dropzoneId}`;
        return $('<label>', {
            for: labelFor,
            class: 'choose-file-label'
        }).html('<i class="fas fa-upload"></i>Choose Files');
    }

    createAddIconElement() {
        return $('<div>', { class: 'add-icon hidden' }).html('<i class="fas fa-plus"></i>');
    }

    createDropzoneMessageElements() {
        return [$('<p>').text('Drag and drop files here'), $('<p>').text('Or'), this.$chooseFileLabel, this.$fileInput, this.$addIcon];
    }

    init() {
        this.$dropzone.on('dragover dragenter', (event) => {
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
                this.$preview.empty();
            }
            this.handleFiles(droppedFiles);
        });

        const fileInput = this.$dropzone.find('.choose-file-input');
        fileInput.on('change', (event) => {
            if (!this.multipleFiles) {
                this.$preview.empty();
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
                    const { item, newIndex, oldIndex } = event;
                    const filename = item.getAttribute('data-filename');
                    const movedFile = this.files.files.splice(oldIndex, 1)[0];
                    this.files.files.splice(newIndex, 0, movedFile);
                    this.files.files.forEach((file, index) => {
                        file.order = index + 1;
                    });
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
        const $popup = $('.zoom-popup');
        if ($popup.length > 0) {
            $popup.remove();
        }

        const $zoomedImg = $('<img>', {
            class: 'zoomed-image',
            src: ''
        });
        const $closeIcon = $('<span>', {
            class: 'close-icon',
            html: '&times;'
        });
        const $prevIcon = $('<span>', {
            class: 'nav-icon prev-icon',
            html: '<i class="fas fa-chevron-left"></i>'
        });
        const $nextIcon = $('<span>', {
            class: 'nav-icon next-icon',
            html: '<i class="fas fa-chevron-right"></i>'
        });

        const $newPopup = $('<div>', { class: 'zoom-popup' });
        $newPopup.append($zoomedImg);
        $newPopup.append($closeIcon);
        $newPopup.append($prevIcon);
        $newPopup.append($nextIcon);
        $newPopup.appendTo('body');

        const $previewItems = this.$preview.find('.preview-item');
        const totalItems = $previewItems.length;

        $zoomedImg.addClass('active-image');

        $prevIcon.on('click', () => {
            $('.active-image').removeClass('active-image'); // Remove active class from all images
            $zoomedImg.attr('src', ''); // Clear current image
            index = (index - 1 + totalItems) % totalItems;
            const $currentItem = $previewItems.eq(index);
            const currentDataUrl = $currentItem.find('img').attr('src');
            $zoomedImg.attr('src', currentDataUrl);
            $zoomedImg.addClass('active-image');
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
            event.stopPropagation();
            $('.zoom-popup').remove();
            console.log('Close icon clicked');
        });

        // Set the initial image
        const $currentItem = $previewItems.eq(index);
        const initialDataUrl = $currentItem.find('img').attr('src');
        $zoomedImg.attr('src', initialDataUrl);
    }
    handleFiles(selectedFiles) {
        $.each(selectedFiles, (index, file) => {
            const extension = file.name.split('.').pop().toLowerCase();
            if (!this.allowedExtensions.includes(extension)) {
                alert(`The file ${file.name} is not allowed.`);
                return true;
            }

            // Check if the file is already in the array
            if (this.files.files.some(existingFile => existingFile.raw_name === file.name)) {
                console.log(`The file ${file.name} already exists.`);
            } else {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const newFile = {
                        size: (file.size / 1024).toFixed(3),
                        type: file.type,
                        order: this.files.files.length + 1,
                        thumbs: [],
                        is_image: file.type.startsWith('image/') ? 1 : 0,
                        raw_name: file.name,
                        dimension: '',
                        extension: extension,
                        full_path: '',
                        original_name: file.name
                    };
                    if (newFile.is_image) {
                        const img = new Image();
                        img.onload = () => {
                            newFile.dimension = img.width + '*' + img.height;
                            this.addPreviewItem({
                                dataUrl: event.target.result,
                                name: file.name,
                                fileObject: newFile
                            });
                        };
                        img.src = event.target.result;
                    } else {
                        this.addPreviewItem({
                            dataUrl: event.target.result,
                            name: file.name,
                            fileObject: newFile
                        });
                    }
                    this.files.files.push(newFile);
                };
                reader.readAsDataURL(file);
                reader.onerror = function () {
                    console.log(reader.error);
                };
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
        const div = $('<div>', {
            class: 'preview-item',
            'data-filename': fileData.name,
        });

        const iconsDiv = $('<div>', { class: 'icons' });

        const removeIcon = $('<span>', {
            class: 'remove-icon',
            html: '<i class="fas fa-trash"></i>',
        });

        removeIcon.on('click', () => {
            div.remove();
            this.files.files = this.files.files.filter(file => file.raw_name !== fileData.name);
            if (this.$preview.find('.preview-item').length === 0) {
                this.$addIcon.removeClass('hidden');
            }
        });

        iconsDiv.append(removeIcon);

        if (fileData.fileObject.is_image) {
            const img = $('<img>', {
                src: fileData.dataUrl,
                alt: fileData.name,
            });

            const zoomIcon = $('<span>', {
                class: 'zoom-icon',
                html: '<i class="fas fa-search-plus"></i>',
            });

            zoomIcon.on('click', () => this.showZoomPopup(this.$preview.find('.preview-item').index(div)));

            iconsDiv.append(zoomIcon);

            div.append(img);

            const fileNameLabel = $('<label>', {
                class: 'file-name-label',
                text: fileData.name,
            });

            div.append(fileNameLabel);
        } else {
            const fileIcon = $('<i>', {
                class: 'fas ' + this.getFontAwesomeClass(fileData.fileObject.extension) + ' file-icon'
            });

            const fileNameLabel = $('<label>', {
                class: 'file-name-label',
                text: fileData.name,
                title: fileData.name,
            });

            div.append(fileIcon);
            div.append(fileNameLabel);
        }

        const dragDropIcon = $('<span>', {
            class: 'drag-drop-icon',
            html: '<i class="fas fa-arrows-alt"></i>',
        });

        iconsDiv.append(dragDropIcon);

        div.append(iconsDiv);

        const hiddenFileInput = $('<input>', {
            type: 'hidden',
            name: this.$fileInput.attr('name'),
            value: JSON.stringify(fileData.fileObject),
            class: 'hidden-file-input'
        }).appendTo(div);

        this.$preview.append(div);
    }

    getFontAwesomeClass(extension) {
        switch (extension) {
            case 'pdf':
                return 'fa-file-pdf';
            case 'doc':
            case 'docx':
                return 'fa-file-word';
            case 'xls':
            case 'xlsx':
                return 'fa-file-excel';
            case 'mp3':
                return 'fa-file-audio';
            case 'mp4':
            case 'avi':
            case 'mov':
                return 'fa-file-video';
            case 'txt':
                return 'fa-file-alt';
            case 'zip':
            default:
                return 'fa-file';
        }
    }
}
