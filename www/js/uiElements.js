//  Copyright (c) 2014-2015 Thomas Baker
//  
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//  
//  The above copyright notice and this permission notice shall be included in
//  all copies or substantial portions of the Software.
//  
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//  THE SOFTWARE.
"use strict";


;
(function ($, window, document, undefined) {


    //--------------------------------------------------------------------------
    //
    // Page classes
    //
    //--------------------------------------------------------------------------

    var pageView = Backbone.View.extend({

        commonEvents: {
            "click #link-button": "navigate"
        },

        constructor: function (options) {
            //console.log("pageView constructor");

            // Resolve events between super and sub class
            this.events = _.extend({}, this.commonEvents, this.events);

            // Create and initialize state
            this._content_template = null;
            this._itemList = [];
            //this.index = -1;
            this.back = true;
            //this.position = 1;
            this.name = options["name"];
            if (options["back"] === false) {
                this.back = false;
            }

            var contentTemplate = options["content"];
            if (contentTemplate) {
                this.content(contentTemplate);
            }

            // Call the original constructor
            Backbone.View.apply(this, arguments);
        },

        initialize: function (options) {
            //console.log("initialize pageView");


        },

        content: function (contentTemplate) {
            if (contentTemplate) {
                this._content_template = _.template(contentTemplate);
            }
            return this._content_template;
        },

        navigate: function (event) {
            var target = event.currentTarget;
            var path = $(target).attr("link");
            this.trigger("navigate", path);
        },

        render: function () {
            this.$el.attr({
                "id": name
            });
            this.$el.html("pageView render not implemented");
            return this;
        },

        setEvents: function () {
            this.delegateEvents();
        },

        findErrorText: function () {
            return this.$el.find("#error-message");
        },

        clearErrorText: function () {
            var element = this.findErrorText();
            if (element) {
                element.html("");
                element.removeClass("active");
            }
        },

        addErrorText: function (message, options) {
            var element = this.findErrorText();
            if (element) {
                element.html(element.html() + message);
                element.addClass("active");
            }
        },

        updateForm: function (obj) {
            // This function should be implemented by a child view
            // It is called when a form record is loaded
            console.log("pageView.updateForm not implemented");
        },

        updateData: function (obj) {
            // This function should be implemented by a child view
            // It is called when a data from the server is recieved
            console.log("pageView.updateData not implemented");
        }
    });


    // This is used for the main page

    var mainPage = pageView.extend({

        initialize: function (options) {
            //pageView.prototype.initialize.call(this, options);

            console.log("initialize mainPage ");
            // search the dom to see if the page is already there
            var element = $("#" + this.name);
            if (element) {
                this.setElement(element.get());
            }

        },

        render: function () {
            //var str = this.template({index:this.index,name:this.model.get("name")});
            //var name = this.model.get("name");
            this.$el.attr({
                "id": name
            });
            this.$el.html(this.template({}));
            return this;
        }

    });

    //--------------------------------------------------------------------------
    //
    // Form controls
    //
    //--------------------------------------------------------------------------

    var formControl = Backbone.View.extend({
        _type: "none",
        _data: null,
        _name: "",
        _label: "",
        _common_name: null,
        _default: null,
        _required: false,
        _table: null,
        commonEvents: {},

        constructor: function (options) {
            //console.log("pageView constructor");

            // Resolve events between super and sub class
            this.events = _.extend({}, this.commonEvents, this.events);
            
            if (options.name) {
                this._name = options.name;
            }
            if (options.common_name) {
                this._common_name = options.common_name;
                this._label = options.common_name;
            }
            if (options.required && (options.required === true)) {
                this._required = true;
            }
            this._data = this._default;

            // Call the original constructor
            Backbone.View.apply(this, arguments);
        },
        initialize: function (options) {
            console.log("formControl intialize should not be called");
        },
        render: function () {
            this.$el.attr({
                "id": name
            });
            this.$el.html(this.template({}));
            return this;
        },

        setControl: function (value) {
            console.log("formControl setControl should not be called");
        },

        setData: function (value) {
            console.log("formControl setData should not be called");
        },

        getData: function () {
            console.log("formControl getData should not be called");
            return undefined;
        },

        setEvents: function () {
            this.delegateEvents();
        },
        reset: function() {
        }
    });

    var stringControl = formControl.extend({
        _type: "string",
        _default: "",
        template: _.template(
        "<div id='<%= id %>' name='<%= name %>' data-role='fieldcontain' class='se-form-control-string'>" +
            "<label><%= label %></label>" +
            "<input id='input' type='string' name='<%= name %>' value='<%= value %>' />" +
            "</div>"),
        initialize: function (options) {
            this.reset();
        },
        render: function () {
            var t = this.template({
                id: this._name,
                label: this._label,
                name: this._name,
                value: this._data

            });
            //this.$el.attr();
            this.$el.html(this.template({
                id: this._name,
                label: this._label,
                name: this._name,
                value: this._data

            }));
            return this.$el;
        },
        
        setControl: function(record) {
            if (this._common_name) {
                return;
            }
            if (record["@label"]) {
                this._label = record["@label"];
                if (this._required) {
                    this._label += '<bold style="color:red">*</bold>';
                }
                var element = this.$el.find("label");
                if (element.length) {
                    element.html(this._label);
                }
            }
        },

        setData: function (data) {
            //console.log("stringControl setData");
            this._data = data;
            this.$el.find("input").val(data);
        },

        getData: function () {
            //console.log("stringControl getData");
            this._data = this.$el.find("input").val();
            return this._data;;
        },
        reset: function() {
            this.setData(this._default);
        }
    });

    var textControl = formControl.extend({
        _type: "text",
        _default: "",
        template: _.template(
        "<div id='<%= id %>' name='<%= name %>' data-role='fieldcontain' class='se-form-control-text'>" +
            "<label><%= label %></label>" +
            "<input id='input' type='string' name='<%= name %>' value='<%= value %>' />" +
            "</div>"),
        initialize: function (options) {
            this.reset();
        },
        render: function () {
            var t = this.template({
                id: this._name,
                label: this._label,
                name: this._name,
                value: this._data

            });
            //this.$el.attr();
            this.$el.html(this.template({
                id: this._name,
                label: this._label,
                name: this._name,
                value: this._data

            }));
            return this.$el;
        },
        
        setControl: function(record) {
            if (this._common_name) {
                return;
            }
            if (record["@label"]) {
                this._label = record["@label"];
                if (this._required) {
                    this._label += '<bold style="color:red">*</bold>';
                }
                var element = this.$el.find("label");
                if (element.length) {
                    element.html(this._label);
                }
            }
        },

        setData: function (data) {
            //console.log("stringControl setData");
            this._data = data;
            this.$el.find("input").val(data);
        },

        getData: function () {
            //console.log("stringControl getData");
            this._data = this.$el.find("input").val();
            return this._data;;
        },
        reset: function() {
            this.setData(this._default);
        }
    });

    var integerControl = formControl.extend({
        _type: "integer",
        _default: 0,
        template: _.template(
        "<div id='<%= id %>' name='<%= name %>' data-role='fieldcontain' class='se-form-control-string'>" +
            "<label><%= label %></label>" +
            "<input id='input' type='number' name='<%= name %>'  value='<%= value %>' />" +
            "</div>"),
        initialize: function (options) {
            this.reset();
        },
        render: function () {
            //this.$el.attr();
            this.$el.html(this.template({
                id: this._name,
                label: this._label,
                name: this._name,
                value: this._data

            }));
            return this.$el;
        },
        
        setControl: function(record) {
            if (this._common_name) {
                return;
            }
            if (record["@label"]) {
                this._label = record["@label"];
                if (this._required) {
                    this._label += '<bold style="color:red">*</bold>';
                }
                var element = this.$el.find("label");
                if (element.length) {
                    element.html(this._label);
                }
            }
        },

        setData: function (data) {
            //console.log("integerControl setData");
            this._data = data;
            this.$el.find("input").val(data);
        },

        getData: function () {
            //console.log("integerControl getData");
            this._data = this.$el.find("input").val();
            return this._data;;
        },
        reset: function() {
            this.setData(this._default);
        }
    });
    
    var selectControl = formControl.extend({
        _type: "string",
        _default: 0,
        template: _.template(
        "<div id='<%= id %>' name='<%= name %>' data-role='fieldcontain' class='se-form-control-select'>" +
            "<label><%= label %></label>" +
            "<!-- input id='input' type='string' name='<%= name %>' value='<%= value %>' / -->" +
            "<select name='<%= name %>' id='select-<%= name %>'></select>" +
            "</div>"),
        initialize: function (options) {
            this.reset();
        },
        render: function () {
            var t = this.template({
                id: this._name,
                label: this._label,
                name: this._name,
                value: this._data

            });
            //this.$el.attr();
            this.$el.html(this.template({
                id: this._name,
                label: this._label,
                name: this._name,
                value: this._data

            }));
            return this.$el;
        },
        
        setControl: function(record) {
            if (!this._common_name) {
                if (record["@label"]) {
                    this._label = record["@label"];
                    if (this._required) {
                        this._label += '<bold style="color:red">*</bold>';
                    }
                    var element = this.$el.find("label");
                    if (element.length) {
                        element.html(this._label);
                    }
                }
            }
            
            // Fill in select choices
            var select = record.select;
            if (select) {
                var selectOptions = "";
                var options = select[0]["option"];
                for (var j = 0; j < options.length; j++) {
                    var opt = options[j];
                    var value = opt["@value"];
                    var optionLabel = opt["$"] || "";
                    selectOptions += '<option value = "' + value + '">' + optionLabel + '</option>';
                }
                this.$el.find("select").first().html(selectOptions);
            }
        },

        setData: function (data) {
            //console.log("selectControl setData");
            this._data = data;
            this.$el.find("select").val(data);
        },

        getData: function () {
            //console.log("selectControl getData");
            this._data = this.$el.find("select").val();
            return this._data;;
        },
        reset: function() {
            this.setData(this._default);
        }
    });

    //--------------------------------------------------------------------------
    //
    // Dialogs
    //
    //--------------------------------------------------------------------------

    var confirmDialog = Backbone.View.extend({
        //tagName: "fieldset",
        //template: _.template("<%= label %><input id='input' type='text' name='<%= reference %>'>"),
        defaults: {
            headerText: "",
            messageText: ""
        },
        events: {
            "click #ok": "onLogin"
        },

        initialize: function (options) {
            //console.log("new newFormListItem ");
            //this.reference = "";
            //this.label = "";
            var element = document.getElementById('confirm-dialog');
            this.setElement(element);
            //this.$el.hide();


        },

        render: function () {
            return this.$el;
        },

        setText: function (header, message) {
            this.$('#header h3').html(header);
            this.$('#content h3').html(message);
        },

        show: function () {
            //this.render(); //.show();
            //this.$el.popup("open").popup({transition:"none"});
            $("#confirm-dialog").popup("open").popup({
                transition: "none"
            });
        },

        onOK: function (evt) {
            this.$el.popup("close"); //hide();
        }
    });



    var loginDialog = Backbone.View.extend({
        //tagName: "fieldset",
        //template: _.template("<%= label %><input id='input' type='text' name='<%= reference %>'>"),
        defaults: {
            headerText: "",
            messageText: ""
        },
        events: {
            "click #login": "onLogin"
        },

        initialize: function (options) {
            //console.log("new newFormListItem ");
            //this.reference = "";
            //this.label = "";
            var element = document.getElementById('login-dialog');
            this.setElement(element);
            //this.$el.hide();


        },

        render: function () {
            this.setText();
            return this.$el;
        },

        setText: function (header, message) {
            //this.$('#header h3').html(header);
            // this.$('#content h3').html(message);
            var url = app.state.settings.serverInfo.get("url");
            var username = app.state.settings.serverInfo.get("username");
            var password = app.state.settings.serverInfo.get("password");
            this.$el.find("#url").val(url);
            this.$el.find("#username").val(username);
            this.$el.find("#password").val(password);

        },

        getText: function (header, message) {
            //this.$('#header h3').html(header);
            // this.$('#content h3').html(message);
            var url = this.$el.find("#url").val();
            var username = this.$el.find("#username").val();
            var password = this.$el.find("#password").val();
            app.state.settings.serverInfo.set("url", url);
            app.state.settings.serverInfo.set("username", username);
            app.state.settings.serverInfo.set("password", password);

        },

        show: function () {
            //this.render(); //.show();
            //this.$el.popup("open").popup({transition:"none"});
            //$("#confirm-dialog").popup("open").popup({transition:"none"});
            this.setText();
            this.$el.addClass("visible");
        },

        hide: function () {
            //this.render(); //.show();
            //this.$el.popup("open").popup({transition:"none"});
            //$("#confirm-dialog").popup("open").popup({transition:"none"});
            //this.setText();
            this.$el.removeClass("visible");
        },

        onLogin: function (evt) {
            //this.$el.popup("close"); //hide();
            var params = {
                "url": this.$el.find("#url").val(),
                "username": this.$el.find("#username").val(),
                "password": this.$el.find("#password").val()
            };
            //this.hide();
            app.controller.login(params);
        },
        onError: function (message) {
            console.log("login dialog error " + message);
        }
    });

    app.view.addPage("pageView", pageView);
    app.view.addPage("mainPage", mainPage);
    app.view.addPage("confirmDialog", confirmDialog);
    app.view.addPage("loginDialog", loginDialog);
    app.view.addControl("string",stringControl);
    app.view.addControl("text",textControl);
    app.view.addControl("integer",integerControl);
   app.view.addControl("select",selectControl);


})(jQuery, window, document);