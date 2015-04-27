//  Copyright (c) 2014 Thomas Baker
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


    var hospitalTable = [
        {
            name: "name",
            control: "string",
            form_path: "$_hms_hospital/field",
            form: "hospital-form",
            label: "",
            required: true
        },
        ///*
        {
            name: "aka1",
            control: "string",
            form_path: "$_hms_hospital/field",
            form: "hospital-form",
            label: ""
        },
        {
            name: "code",
            control: "string",
            form_path: "$_hms_hospital/field",
            form: "hospital-form",
            label: ""
        },
        {
            name: "facility_type",
            control: "integer",
            form_path: "$_hms_hospital/field",
            form: "hospital-form",
            label: ""
        },
        {
            name: "L0",
            control: "select",
            form_path: "$_gis_location/field",
            data_path: "$_gis_location/field",
            reference: "$k_location_id",
            form: "gis-location-form",
            common_name: "Country",
            label: ""
        },
        {
            name: "addr_street",
            control: "string",
            form_path: "$_gis_location/field",
            data_path: "$_gis_location/field",
            reference: "$k_location_id",
            form: "gis-location-form",
            label: ""
        }
        //*/
    ];


    var hospitalItemElement = Backbone.View.extend({ //pageView.extend({
        tagName: "tr",
        //className: "accordian",
        name: "",
        template: null, 
        events: {
            "click input#open": "onOpen"

        },
        initialize: function (options) {
            // Set up model change event
            var model = this.model;
            model.on("change", this.update.bind(this));
            this.template = this.createTemplate(hospitalTable);
        },
        createTemplate: function(table) {
            var templateString = "<td class='actions se-column-all'><input id='open' class='edit-button' value='Open' type='button'></td>";
            for (var i = 0; i < table.length; i++) {
                var tableItem = table[i];
                templateString += "<td class='se-column-" + tableItem["table_priority"] + "'><%= " + tableItem["name"] + " %></td>";
            }
            return _.template(templateString);
        },
        render: function () {

            // records loaded from the server have more data than locally stored
            var templateData = this.model.getData(hospitalTable);
            this.$el.html(this.template(templateData));

            return this;
        },

        update: function (evt) {
            console.log("updating item list item ");
            this.render();
        },

        onOpen: function () {
            console.log("itemsItemElement onOpen");
            var controller = app.controller.getControllerByModel("hospital");
            controller.editItem(this.model);
        },

    });

    var pageView = app.view.getPage("pageView");
    var hospitalsPage = pageView.extend({ //pageView.extend({
        tagName: "div",
        className: "se-page",
        name: "",
        template: _.template(
            "<div class='fixed'>" +
            "<div class='row'>" +
            "<nav class='top-bar' data-topbar=' '>" +
            "<ul class='title-area'>" +
            "<li class='name'>" +
            "<h1><a id='link-button' link='page-back'>< Back</a></h1>" +
            "</li>" +
            "</li>" +
            "</ul>" +
            //"</section>" +
            "</nav>" +
            "</div>" +
            "</div>" +
            "<div id='content'></div>"

        ),
        tableHeaderColumn: _.template(
            '<th ' +
            'index="<%= column_index %>" ' +
            'class="se-column-<%= table_priority %>">' +
            '<%= label %>' +
            '</th>'
        ),
        content_template: null,
        _table: hospitalTable,
        events: {
            "click #link-button": "navigate",
            "click #new-item": "onNewItem",
            "click #refresh-list": "onRefreshList"
        },
        initialize: function (options) {
            console.log("initialize hospitals page");
            var content = options["content"];
            if (content) {
                this.setContent(content);
            }
            var name = options["name"];
            if (name) {
                this.name = name;
            }
        },
        setContent: function (content) {
            if (content) {
                this.content_template = _.template(content);
            }
        },
        render: function () {
            this.$el.html(this.template({}));
            this.$el.attr({
                "id": this.name
            });
            if (this.content_template) {
                this.$el.find("#content").append(this.content_template({}));
            }

            // Fill in table header labels
            var headerRow = this.$el.find("thead tr");
            for (var i = 0; i < hospitalTable.length; i++) {
                var columnItem = hospitalTable[i];
                var priority = columnItem["table_priority"];
                var index = i + 1;
                var label = columnItem["label"];
                headerRow.append(this.tableHeaderColumn({
                    column_index: index,
                    table_priority: priority,
                    label: label
                }));
            }
            return this;
        },

        setItem: function (model) {
            // first check to see if the item element already exists
            var itemElement = null;
            for (var i = 0; i < this._itemList.length; i++) {
                if (this._itemList[i].model === model) {
                    itemElement = this._itemList[i];
                    break;
                }
            }
            if (!itemElement) {
                itemElement = new hospitalItemElement({
                    model: model
                });
                this._itemList.push(itemElement);
                var tableBody = this.$el.find("tbody");
                tableBody.append(itemElement.$el);
                itemElement.render();
            }
        },

        removeItem: function (model) {
            // first check to see if the item element already exists
            var itemElement = null;
            for (var i = 0; i < this._itemList.length; i++) {
                if (this._itemList[i].model === model) {
                    itemElement = this._itemList[i];
                    itemElement.remove();
                    this._itemList.splice(i, 1);
                    break;
                }
            }
        },

        onOpenItem: function (event) {
            console.log("edit");
        },

        expandItem: function (event) {
            console.log("expand");
            // TODO: first make sure that you didn't push a button

        },

        onNewItem: function (event) {
            console.log("onNewItem ");
            var controller = app.controller.getControllerByModel("hospital");
            controller.newItem();
            this.trigger("navigate", "page-edit-hospital");
        },

        onRefreshList: function (event) {
            console.log("onRefreshList ");
            app.controller.updateData("hospital");
        },

        updateForm: function (obj) {
            console.log("page-hospital updateForm");
            var tableHeader = this.$el.find("thead tr");

            for (var i = 0; i < hospitalTable.length; i++) {
                var record = obj;
                var label = "";
                var value = "";
                var columnItem = hospitalTable[i];
                var columnName = columnItem["name"];
                var path = columnItem["form_path"];
                var pathList = path.split("/");
                for (var j = 0; j < pathList.length; j++) {
                    var pathItem = pathList[j];

                    if (!record[pathItem]) {
                        record = null;
                        break;
                    }
                    if (pathItem.indexOf("$_") >= 0) {
                        record = record[pathItem][0];
                    } else {
                        record = record[pathItem];
                    }
                }
                if (!record) {
                    continue;
                }

                // find item in array
                if (Array.isArray(record)) {
                    for (var j = 0; j < record.length; j++) {
                        var recordItem = record[j];
                        if (recordItem["@name"] === columnName) {
                            label = recordItem["@label"];
                            var type = recordItem["@type"];
                            switch (type) {
                            case "string":
                                {
                                    value = "";
                                }
                                break;
                            case "integer":
                                {
                                    value = "0";
                                }
                                break;
                            default:
                                {
                                    if (type.indexOf("list:reference") >= 0) {
                                        console.log("\ttype - " + type);
                                    } else if (recordItem["@type"].indexOf("reference") >= 0) {
                                        console.log("\ttype - " + type);
                                    } else {
                                        console.log("\ttype unknown - " + type);
                                    }
                                }
                            }

                            // Do the table row
                            if (columnItem["common_name"]) {
                                label = columnItem["common_name"];
                            }
                            var columnIndex = i + 1;
                            var columnElement = tableHeader.find("th[index='" + columnIndex + "']");
                            if (!columnElement.length) {
                                var tableString = this.tableHeaderColumn({
                                    column_index: columnIndex,
                                    table_priority: columnItem["table_priority"],
                                    label: label
                                })
                                tableHeader.append(tableString);
                            } else {
                                columnItem["label"] = label;
                                columnElement.html(label);
                            }
                            break;
                        }
                    }
                } else {
                    console.log("not array");
                }
            }
        },

        updateData: function (obj) {
            console.log("page-hospital updateData");
        },
        
        setEvents: function() {
        this.delegateEvents();
                    for (var i = 0; i < this._itemList.length; i++) {
                this._itemList[i].delegateEvents();
            }

    }
    });

    app.pluginManager.addObject(hospitalsPage);

})(jQuery, window, document);