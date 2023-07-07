$(document).ready(function() {
    var $dropzone = $('#dropzone');
    var $preview = $('#preview');
    var $addIcon = $('#add-icon');
    var files = [];

    $dropzone.on('dragover', function(event) {
        event.preventDefault();
        event.stopPropagation();
        $(this).addClass('dragover');
    });

    $dropzone.on('dragenter', function(event) {
        event.preventDefault();
        event.stopPropagation();
        $(this).addClass('dragover');
    });

    $dropzone.on('dragleave', function(event) {
        event.preventDefault();
        event.stopPropagation();
        $(this).removeClass('dragover');
    });

    $dropzone.on('drop', function(event) {
        event.preventDefault();
        event.stopPropagation();
        $(this).removeClass('dragover');
        $('.border-box').remove();

        var droppedFiles = event.originalEvent.dataTransfer.files;
        handleFiles(droppedFiles);
    });

    $('#fileinput').on('change', function() {
        var selectedFiles = $(this).prop('files');
        handleFiles(selectedFiles);
    });

    $addIcon.on('click', function() {
        $('#fileinput').click();
    });

    $preview.on('click', '.remove-icon', function() {
        var $previewItem = $(this).closest('.preview-item');
        var index = $previewItem.index();
        files.splice(index, 1);
        $previewItem.remove();

        if (files.length === 0) {
            $addIcon.addClass('hidden');
        }
    });

    $preview.on('click', '.zoom-icon', function() {
        var $image = $(this).closest('.preview-item').find('img');
        var imageDataUrl = $image.attr('src');
        var $popup = $('<div>', { class: 'zoom-popup' });
        var $zoomedImg = $('<img>', { class: 'zoomed-image', src: imageDataUrl });
        var $closeIcon = $('<span>', { class: 'close-icon', html: '&times;' });

        $popup.append($zoomedImg);
        $popup.append($closeIcon);
        $popup.appendTo('body');

        $closeIcon.on('click', function() {
            $popup.remove();
        });
    });

    $preview.sortable({
        containment: 'parent',
        tolerance: 'pointer',
        cursor: 'move',
        placeholder: 'sortable-placeholder',
        axis: 'x',
        update: function(event, ui) {
            var newOrder = $preview.sortable('toArray', { attribute: 'data-filename' });
            files.sort(function(a, b) {
                return newOrder.indexOf(a.name) - newOrder.indexOf(b.name);
            });
        },
    });

    $preview.on('mousedown', '.drag-drop-icon', function(event) {
        $(this).closest('.preview-item').addClass('dragging');
    });

    $preview.on('mouseup', '.drag-drop-icon', function(event) {
        $(this).closest('.preview-item').removeClass('dragging');
    });

    $preview.on('mousemove', '.drag-drop-icon', function(event) {
        var $draggingItem = $(this).closest('.preview-item.dragging');
        if ($draggingItem.length) {
            var $sortablePlaceholder = $('<div>', { class: 'sortable-placeholder' });
            var $prevItem = $draggingItem.prev();
            var mouseY = event.pageY - $dropzone.offset().top;
            var $nextItem;

            if (mouseY < $draggingItem.outerHeight() / 2) {
                $prevItem.before($sortablePlaceholder);
                $nextItem = $sortablePlaceholder.next();
            } else {
                $draggingItem.after($sortablePlaceholder);
                $nextItem = $sortablePlaceholder.prev();
            }

            $sortablePlaceholder.before($draggingItem);
            $sortablePlaceholder.remove();

            if ($nextItem.length) {
                $draggingItem.insertAfter($nextItem);
            }
        }
    });

    function handleFiles(selectedFiles) {
        $.each(selectedFiles, function(index, file) {
            if (file.type.match('image.*')) {
                var isDuplicate = false;
                for (var i = 0; i < files.length; i++) {
                    if (files[i].name === file.name && files[i].size === file.size) {
                        isDuplicate = true;
                        break;
                    }
                }

                if (!isDuplicate) {
                    var fileData = {
                        file: file,
                        dataUrl: null,
                    };
                    files.push(fileData);

                    var reader = new FileReader();
                    reader.onload = function(event) {
                        var img = $('<img>', {
                            src: event.target.result,
                            alt: file.name,
                        });

                        var div = $('<div>', {
                            class: 'preview-item',
                            'data-filename': file.name,
                            'data-index': files.length - 1,
                        });

                        var iconsDiv = $('<div>', { class: 'icons' });
                        var removeIcon = $('<span>', {
                            class: 'remove-icon',
                            html: '<i class="fas fa-trash"></i>',
                        });
                        var zoomIcon = $('<span>', {
                            class: 'zoom-icon',
                            html: '<i class="fas fa-search-plus"></i>',
                        });
                        var dragDropIcon = $('<span>', {
                            class: 'drag-drop-icon',
                            html: '<i class="fas fa-arrows-alt"></i>',
                        });

                        iconsDiv.append(removeIcon);
                        iconsDiv.append(zoomIcon);
                        iconsDiv.append(dragDropIcon);

                        div.append(img);
                        div.append(iconsDiv);
                        $preview.append(div);

                        fileData.dataUrl = event.target.result;

                        $('.drag-drop-icon').parent().sortable({
                            containment: 'parent',
                            tolerance: 'pointer',
                            cursor: 'move',
                            placeholder: 'sortable-placeholder',
                            axis: 'x',
                            handle: '.drag-drop-icon',
                            update: function(event, ui) {
                                var newOrder = $preview.sortable('toArray', { attribute: 'data-filename' });
                                files.sort(function(a, b) {
                                    return newOrder.indexOf(a.name) - newOrder.indexOf(b.name);
                                });
                            },
                        });

                    };

                    reader.readAsDataURL(file);
                }
            }
        });

        if (files.length > 0) {
            $addIcon.removeClass('hidden');
        } else {
            $addIcon.addClass('hidden');
        }
    }
});
