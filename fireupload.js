class FireUploader {
    constructor(dropzoneId, inputName = 'file', files_arr = {files: [], fileCount: 0}) {
        $(".fireupload").each((index, element) => {
            if ($(element).attr('id') == dropzoneId) {
                const instance = Object.create(FireUploader.prototype);
                instance.$dropzone = $(element);
                instance.$preview = $('<div>', {class: 'preview'}).appendTo(instance.$dropzone);
                instance.$fileInput = $('<input>', {type: 'file', name: inputName, class: 'choose-file-input', multiple: true, id: 'fileInput' + instance.$dropzone.attr('id')}).appendTo(instance.$dropzone);
                instance.$chooseFileLabel = $('<label>', {for: 'fileInput' + instance.$dropzone.attr('id'), class: 'choose-file-label'}).html('<i class="fas fa-upload"></i>Choose Files').appendTo(instance.$dropzone);
                instance.$addIcon = $('<div>', {class: 'add-icon hidden'}).html('<i class="fas fa-plus"></i>').appendTo(instance.$dropzone);
                instance.$dropzone.append($('<p>').text('Drag and drop files here'), $('<p>').text('Or'), instance.$chooseFileLabel, instance.$fileInput, instance.$addIcon);

                instance.files = files_arr;

                instance.init();
                instance.handlePreloadedFiles();
            }
        });
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
            this.handleFiles(droppedFiles);
        });

        const fileInput = this.$dropzone.find('.choose-file-input');
        fileInput.on('change', (event) => {
            this.handleFiles(event.target.files);
        });

        const addIcon = this.$dropzone.find('.add-icon');
        addIcon.on('click', () => {
            fileInput.click();
        });

        Sortable.create(this.$preview[0], {
            handle: '.drag-drop-icon',
            animation: 150,
            onEnd: (event) => {
                const item = event.item;
                const newIndex = event.newIndex;
                const filename = item.getAttribute('data-filename');
                // Perform any necessary operations with the new index and filename
            }
        });

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

        const $newPopup = $('<div>', { class: 'zoom-popup' });
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
                const reader = new FileReader();
                reader.onload = (event) => {
                    this.addPreviewItem({
                        dataUrl: event.target.result,
                        name: file.name,
                    });
                };
                reader.readAsDataURL(file);
            }
        });
    }

    handlePreloadedFiles() {
        if (this.files.fileCount > 0) {
            $.each(this.files.files, (index, file) => {
                this.addPreviewItem({
                    dataUrl: file.full_path,
                    name: file.original_name,
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

        this.$preview.append(div);

        removeIcon.on('click', () => {
            div.remove();
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
        this.$addIcon.appendTo(this.$preview);
        this.$addIcon.removeClass('hidden');
    }
}
