/**
 * Bootstrap 3 FileInput (https://github.com/davidlomidze/bootstrap-fileinput)
 *
 * MIT License
 * Copyright (c) 2018 David Lomidze
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
(function($) {
    "use strict";

    /**
     * Constructor to create a new fileinput using the given select and options
     *
     * @param {jQuery} selector
     * @param {Object} options
     * @returns {jQuery} selector
     */
    function FileInput(selector, options) {

        // Get this object
        this.$fileInput = $(selector);

        // Define properties
        this.fileName = "" || this.$fileInput.attr("value");
        this.isValid = true;

        // Merge default options, user options and local textes
        this.options = $.extend({}, this.defaults, $.fn.fileinput.locales, options);

        // Bide input and build html
        this.build();

        // Run custom method init within fileInput scope
        this.options.init.call(this.$fileInput);

        // Bind browse and clear events
        this.bindEvents();
    }

    FileInput.prototype = {

        constructor: FileInput,

        /**
         * Default options
         */
        defaults: {
            buttonGroupClass: "",
            browseButtonClass: "btn-success",
            clearButtonClass: "btn-danger",
            inputClass: "",
            allowedExtensions: "",
            showClearButton: true,
            init: function () {},
            change: function () {},
            clear: function () {},
        },

        /**
         * Create bootstrap elements
         */
        build: function () {

            // generate bootstrap elements
            var html = '<div class="input-group fileinput"><span class="input-group-btn ' + this.options.buttonGroupClass + '"></span></div>';
            var inputHtml = '<input type="text" class="form-control ' + this.options.inputClass + '" placeholder="' + this.options.placeholder + '">';
            var clearButtonHtml = '<button type="button" class="btn ' + this.options.clearButtonClass + '">' + this.options.clearButtonText + '</button>';
            var browseButtonHtml = '<button type="button" class="btn ' + this.options.browseButtonClass + '">' + this.options.browseButtonText + '</button>';

            // Save dom elements
            this.$html = $(html);
            this.$textInput = $(inputHtml).prependTo( this.$html );
            this.$browseButton = $(browseButtonHtml).prependTo( $(".input-group-btn", this.$html) );
            this.$clearButton = $(clearButtonHtml).prependTo( $(".input-group-btn", this.$html) );

            // Set fileName
            this.setFileName();

            // Set clearButton visibility
            this.displayClearButton();

            // Hide original file input and put bootstrap elements after that
            this.$fileInput.after( this.$html ).hide();

        },

        /**
         * Bind click change events to created bootstrap elements.
         */
        bindEvents: function () {

            // Reflect browseButton click event to fileInput click
            this.$browseButton.on("click", $.proxy(function() {
                this.$fileInput.trigger("click");
            }, this));

            // Bind clean event on clearButton click
            this.$clearButton.on("click", $.proxy(this.clear, this));

            // Bind change event on fileInput chenge
            this.$fileInput.on("change", $.proxy(this.change, this));

            // Disable typing into textInput without actually disabling it
            this.$textInput.on("focus", function() {
                $(this).blur();
            });


        },

        /**
         * Original file input change event
         *
         * @param {jQuery} event
         */
        change: function (event) {

            console.log(event);

            // Get browsed file name
            this.fileName = event.target.value.replace(/^.*[\\\/]/, "");

            // Get browsed file extension
            this.fileExtension = event.target.value.split(".").pop().toLowerCase();

            // Get browsed file validity
            if( Array.isArray(this.options.allowedExtensions) ) {
                this.isValid = this.checkValidity();
            } else {
                this.isValid = event.target.validity.valid;
            }

            // Show or hide clearButton if input is valid or not
            this.displayClearButton();

            // Set file name to text input
            this.setFileName();

            // Run custom method within file input scope
            this.options.change.call(this.$fileInput, this.fileName, this.fileExtension, this.isValid);

        },

        /**
         * Shows or hides clearButton
         */
        displayClearButton: function () {

            // Display clear button if custom options is true and fileName exists
            if(this.options.showClearButton && this.fileName) {
                this.$clearButton.show();
            } else {
                this.$clearButton.hide();
            }

        },

        /**
         * Set file name to bootstrap element: text input
         *
         * If no paramet is passed it sets original file input value
         *
         * @param {String} fileName
         */
        setFileName: function (fileName) {

            // Set browsedFileName to textInput
            fileName = fileName || this.fileName;
            this.$textInput.val(fileName);

        },


        /**
         * Clears text input, resets original file input and hides clearButton
         */
        clear: function () {

            // Reset fileInput
            this.$fileInput.wrap("<form>").closest("form").get(0).reset();
            this.$fileInput.unwrap();
            this.$fileInput.attr("value", "");

            // Clean textInput
            this.$textInput.val("");

            // Hide clearButton
            this.$clearButton.hide();

            // Run custom method with file input scope
            this.options.clear.call( this.$fileInput, this.fileName );

        },

        /**
         * Checks file extension validity depended on provided allowed extensions
         *
         * @returns {boolean}
         */
        checkValidity: function () {

            // Check file extension validity if fileName exists and browseFileExtension exists in allowedExtensions optional array
            if(this.fileName) {
                return $.inArray(this.fileExtension, this.options.allowedExtensions.map(function(ext) {
                    return ext.toLowerCase();
                })) > -1;
            }
            return true;

        },

        /**
         * Destroys plugin elements and shows original file input
         */
        destroy: function () {

            // Remove bootstrap elements
            this.$html.remove();

            // Show fileInput
            this.$fileInput.show();

            // Clean FileInput data from input element
            this.$fileInput.data("fileinput", null);
        },

        /**
         * Refreshes bootstrap elements
         */
        refresh: function () {

            // Remove old bootstrap elements
            this.$html.remove();

            // Rebuild bootstrap elements
            this.build();

            // Bind browse and clear events
            this.bindEvents();

        },

        /**
         * Changes/sets plugin options and refreshes plugin to execute changes in real time
         *
         * @param {object} options
         */
        setOptions: function (options) {

            // merge new and existing options
            this.options = $.extend({}, this.options, options);

            // refresh to apply new options
            this.refresh();

        }

    }


    $.fn.fileinput = function(option, parameter) {
        return this.each(function() {
            var data = $(this).data("fileinput");
            var options = typeof option === "object" && option;

            // Initialize the fileinput
            if (!data) {
                data = new FileInput(this, options);
                $(this).data("fileinput", data);
            }

            // Call fileinput method
            if (typeof option === "string") {
                data[option](parameter);
            }
        });
    }

    $.fn.fileinput.Constructor = FileInput;

    /**
     * Default texts
     */
    $.fn.fileinput.locales = {
        placeholder: "Choose file...",
        browseButtonText: "Browse",
        clearButtonText: "Remove"
    }

})(window.jQuery)