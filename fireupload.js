class FireUploader {
    constructor(options = {}) { // Default to an empty object if no argument is passed
        this.$dropzone = $('#dropzone');
        this.$preview = $('#preview');
        this.$addIcon = $('#add-icon');
        this.files = options.files || [];

        this.init();
        this.handlePreloadedFiles();
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

        $('#fileinput').on('change', (event) => {
            this.handleFiles(event.target.files);
        });

        this.$addIcon.on('click', () => {
            $('#fileinput').click();
        });

        this.$preview.sortable({
            containment: 'parent',
            tolerance: 'pointer',
            cursor: 'move',
            placeholder: 'sortable-placeholder',
            handle: '.drag-drop-icon',
            start: (event, ui) => {
                ui.placeholder.height(ui.helper.outerHeight());
            },
            sort: (event, ui) => {
                const containerScrollLeft = this.$preview.scrollLeft();
                const containerWidth = this.$preview.width();
                const itemWidth = ui.helper.outerWidth();
                const leftOffset = ui.position.left - containerScrollLeft;

                if (leftOffset < 0 || leftOffset > containerWidth - itemWidth) {
                    this.$preview.css('cursor', 'not-allowed');
                } else {
                    this.$preview.css('cursor', 'move');
                }
            },
            stop: (event, ui) => {
                this.$preview.css('cursor', 'auto');
            },
        });
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

        const iconsDiv = $('<div>', { class: 'icons' });
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
        });

        zoomIcon.on('click', () => {
            const $popup = $('<div>', { class: 'zoom-popup' });
            const $zoomedImg = $('<img>', {
                class: 'zoomed-image',
                src: fileData.dataUrl,
            });
            const $closeIcon = $('<span>', {
                class: 'close-icon',
                html: '&times;',
            });

            $popup.append($zoomedImg);
            $popup.append($closeIcon);
            $popup.appendTo('body');

            $closeIcon.on('click', function () {
                $popup.remove();
            });
        });

        this.$addIcon.removeClass('hidden');
    }
}
