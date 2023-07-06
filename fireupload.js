class FireUploader {
    constructor(options = {}) {
        this.files = options.files || [];
        this.$dropzone = $('#dropzone');
        this.$preview = $('#preview');
        this.$addIcon = $('#add-icon');
        this.initialize();
    }

    initialize() {
        this.bindEvents();
        $(document).ready(() => {
            this.renderPreloadedFiles();
        });
    }

    bindEvents() {
        this.$dropzone.on('dragover', this.handleDragOver.bind(this));
        this.$dropzone.on('dragenter', this.handleDragEnter.bind(this));
        this.$dropzone.on('dragleave', this.handleDragLeave.bind(this));
        this.$dropzone.on('drop', this.handleDrop.bind(this));
        $('#fileinput').on('change', this.handleFileSelect.bind(this));
        this.$addIcon.on('click', this.handleAddIconClick.bind(this));
        this.$preview.on('click', '.remove-icon', this.handleRemoveIconClick.bind(this));
        this.$preview.on('click', '.zoom-icon', this.handleZoomIconClick.bind(this));
        this.$preview.sortable({
            containment: 'parent',
            tolerance: 'pointer',
            cursor: 'move',
            placeholder: 'sortable-placeholder',
            axis: 'x',
            update: this.handleSortUpdate.bind(this),
        });
    }

    handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
        this.$dropzone.addClass('dragover');
    }

    handleDragEnter(event) {
        event.preventDefault();
        event.stopPropagation();
        this.$dropzone.addClass('dragover');
    }

    handleDragLeave(event) {
        event.preventDefault();
        event.stopPropagation();
        this.$dropzone.removeClass('dragover');
    }

    handleDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        this.$dropzone.removeClass('dragover');
        $('.border-box').remove();

        const droppedFiles = event.originalEvent.dataTransfer.files;
        this.handleFiles(droppedFiles);
    }

    handleFileSelect() {
        const selectedFiles = $('#fileinput').prop('files');
        this.handleFiles(selectedFiles);
    }

    handleAddIconClick() {
        $('#fileinput').click();
    }

    handleRemoveIconClick(event) {
        const $previewItem = $(event.currentTarget).closest('.preview-item');
        const index = $previewItem.index();
        this.files.splice(index, 1);
        $previewItem.remove();

        if (this.files.length === 0) {
            this.$addIcon.addClass('hidden');
        }
    }

    handleZoomIconClick(event) {
        const $image = $(event.currentTarget).siblings('img');
        const imageUrl = $image.attr('src');
        const $popup = $('<div>', { class: 'zoom-popup' });
        const $zoomedImg = $('<img>', { class: 'zoomed-image', src: imageUrl });
        const $closeIcon = $('<span>', { class: 'close-icon', html: '&times;' });

        $popup.append($zoomedImg);
        $popup.append($closeIcon);
        $popup.appendTo('body');

        $closeIcon.on('click', function() {
            $popup.remove();
        });
    }

    handleSortUpdate() {
        const newOrder = this.$preview.sortable('toArray', { attribute: 'data-filename' });
        this.files.sort((a, b) => newOrder.indexOf(a.name) - newOrder.indexOf(b.name));
    }

    handleFiles(selectedFiles) {
        $.each(selectedFiles,
            function(index, file) {
                if (file.type.match('image.*')) {
                    const isDuplicate = this.files.some(existingFile =>
                        existingFile.name === file.name && existingFile.size === file.size
                    );
                    if (!isDuplicate) {
                        this.files.push(file);

                        const reader = new FileReader();
                        reader.onload = event => {
                            const img = $('<img>', {
                                src: event.target.result,
                                alt: file.name,
                            });

                            const div = $('<div>', {
                                class: 'preview-item',
                                'data-filename': file.name,
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

                            iconsDiv.append(removeIcon);
                            iconsDiv.append(zoomIcon);

                            div.append(img);
                            div.append(iconsDiv);
                            this.$preview.append(div);
                        };

                        reader.readAsDataURL(file);
                    }
                }
            });

        this.updateAddIconVisibility();
    }

    renderPreloadedFiles() {
        if (this.files.length > 0) {
            this.$addIcon.removeClass('hidden');
            this.files.forEach(file => {
                const img = $('<img>', {
                    src: file.full_path,
                    alt: file.original_name,
                });

                const div = $('<div>', {
                    class: 'preview-item',
                    'data-filename': file.original_name,
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

                iconsDiv.append(removeIcon);
                iconsDiv.append(zoomIcon);

                div.append(img);
                div.append(iconsDiv);
                this.$preview.append(div);
            });
        }
    }

    updateAddIconVisibility() {
        if (this.files.length > 0) {
            this.$addIcon.removeClass('hidden');
        } else {
            this.$addIcon.addClass('hidden');
        }
    }
}
