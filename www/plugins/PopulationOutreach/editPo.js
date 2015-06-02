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


    var editHouseholdForm = [
        {
            name: "area_id",
            control: "select",
            form_path: "$_po_household/field",
           // reference: "$_po_household",
            form: "po-household-form",
            table_priority: "large",
            required: true
         },
        {
            name: "parent",
            control: "select",
            form_path: "$_gis_location/field",
            reference: "$k_location_id",
            form: "gis-location-form",
            common_name: "Country",
            table_priority: "large"
        },
        {
            name: "addr_street",
            control: "string",
            form_path: "$_gis_location/field",
            reference: "$k_location_id",
            form: "gis-location-form",
            table_priority: "medium"
        },
        {
            name: "addr_postcode",
            control: "string",
            form_path: "$_gis_location/field",
            reference: "$k_location_id",
            form: "gis-location-form",
            table_priority: "medium"
        },
        {
            name: "date_visited",
            control: "date",
            form_path: "$_po_household/field",
            form: "po-household-form",
            table_priority: "medium",
            required: true
        },
        {
            name: "followup",
            control: "checkbox",
            form_path: "$_po_household/field",
            form: "po-household-form",
            table_priority: "medium"
        },
        {
            name: "comments",
            control: "string",
            form_path: "$_po_household/field",
            form: "po-household-form",
            table_priority: "medium"
        }
 ];
/*    var editShelterForm = [
        {
            name: "name",
            control: "string",
            form_path: "$_cr_shelter/field",
            form: "shelter-form",
            label: "",
            required: true
        },
        {
            name: "organisation_id",
            control: "select"
        },
        {
            name: "shelter_type_id",
            control: "select",
            form_path: "$_cr_shelter/field",
            form: "shelter-form",
            label: ""
        },
        {
            name: "shelter_service_id",
            control: "select"
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
        },
        {
            name: "addr_postcode",
            control: "string",
            form_path: "$_gis_location/field",
            data_path: "$_gis_location/field",
            reference: "$k_location_id",
            form: "gis-location-form",
            label: ""
        },
        {
            name: "location",
            control: "gis_button"
        },
        {
            name: "phone",
            control: "string",
            form_path: "$_cr_shelter/field",
            form: "shelter-form",
            label: ""
        },
        {
            name: "email",
            control: "string",
            form_path: "$_cr_shelter/field",
            form: "shelter-form",
            label: ""
        },
        {
            name: "person_id",
            control: "select"
        },
        {
            name: "population",
            control: "integer",
            form_path: "$_cr_shelter/field",
            form: "shelter-form",
            label: ""
        },
        {
            name: "capacity_day",
            control: "integer",
            form_path: "$_cr_shelter/field",
            form: "shelter-form",
            label: ""
        },
        {
            name: "capacity_night",
            control: "integer",
            form_path: "$_cr_shelter/field",
            form: "shelter-form",
            label: ""
        },
        {
            name: "status",
            control: "select",
            form_path: "$_cr_shelter/field",
            form: "shelter-form",
            label: ""
        },
        {
            name: "comments",
            control: "string",
            form_path: "$_cr_shelter/field",
            form: "shelter-form",
            label: ""
        },
        {
            name: "obsolete",
            control: "checkbox"
        },
        {
            name: "footer",
            control: "text"
        }
        ];*/

    var pageView = app.view.getPage("pageView");
    var editHouseholdPage = pageView.extend({ //pageView.extend({
        tagName: "div",
        className: "se-page",
        name: "",
        model: null,
        template: _.template(
            "<div class='fixed'>" +
            "<div class='row'>" +
            "<nav class='top-bar' data-topbar=' '>" +
            "<ul class='title-area'>" +
            "<li class='name'>" +
            "<h1><a >New Household</a></h1>" +
            "</li>" +
            "</li>" +
            "</ul>" +
            "</nav>" +
            "</div>" +
            "</div>" +
            "<div id='content'></div>"
        ),
        content_template: null,
        _table: editHouseholdForm,
        events: {
            "click #link-button": "navigate",
            "click #cancel": "onCancel",
            "click #save": "onSave"
        },
        initialize: function (options) {
            console.log("initialize editPo page");
            var content = options["content"];
            if (content) {
                this.setContent(content);
            }
            var name = options["name"];
            if (name) {
                this.name = name;
            }

            // Add the controls
            this.controlList = [];
            for (var i = 0; i < editHouseholdForm.length; i++) {
                var tableItem = editHouseholdForm[i];
                var controlName = tableItem.name;
                var controlType = tableItem.control;
                var required = tableItem.required && (tableItem.required === true);
               var control = app.view.getControl(controlType);
                if (control) {
                    //console.log("control found " + controlType);
                    var item = new control({
                        name: controlName,
                        common_name: tableItem.common_name,
                        required: required
                    });
                    this.controlList[i] = item;

                }
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

            // Add controls
            var container = this.$el.find("#form-controls");
            for (var i = 0; i < this.controlList.length; i++) {
                var control = this.controlList[i];
                if (control) {
                container.append(control.render());
                }
            }

            return this.$el;
        },

        updateItem: function (obj) {
            console.log("editHouseholdForm updateItem");
        },

        updateForm: function (obj) {
            for (var i = 0; i < editHouseholdForm.length; i++) {
                var record = obj;
                var label = "";
                var value = "";
                var columnItem = editHouseholdForm[i];
                var columnName = columnItem["name"];
                var path = columnItem["form_path"];
                if (!path) { continue; }
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
                
                // update the control
                var control = this.controlList[i];
                if (!control) { continue; }
                if (Array.isArray(record)) {
                    for (var j = 0; j < record.length; j++) {
                        var recordItem = record[j];
                        if (recordItem["@name"] === control._name) {
                                control.setControl(recordItem);
                                break;
                        }
                    }
                } else {
                    control.setForm(record);
                }
            }
        },

        showForm: function (form, model) {
            console.log("editHouseholdForm showForm");
            this.model = model;
            var tableData = model.getTableData(editHouseholdForm);
            for (var i = 0; i < editHouseholdForm.length; i++) {
                var value = "";
                var columnItem = editHouseholdForm[i];
                var columnName = columnItem["name"];
                 var item = tableData[columnName];
                if (item) {
                    var control = this.controlList[i];
                    if (control) {
                        control.setData(item);
                    }
                }
                else {
                    console.log("\titem not found " + columnName);
                }
            }
        },

        getData: function (model) {
            console.log("editHouseholdForm getData");
            var formData = {};
            for (var i = 0; i < editHouseholdForm.length; i++) {
                var value = "";
                var columnItem = editHouseholdForm[i];
                var columnName = columnItem["name"];
                var item = model.get(columnName);
                if (item !== undefined) {
                    var control = this.controlList[i];
                    if (control) {
                        var value = control.getData(item);
                        formData[columnName] = value;
                        //model.set(columnName,value);
                        console.log("\t" + columnName + ": " + value);
                    }
                }
            }
            model.set(formData);
        },

        onCancel: function (event) {
            console.log("onCancel ");
            this.$el.find("legend").scrollTop(0);
            app.view.changePage("page-back");
        },

        onSave: function (event) {
            console.log("onSave ");
            var controller = app.controller.getControllerByModel("po-household-form");
            controller.onFormSubmit(this,this.model);
            //app.view.changePage("page-back");
        },

        findErrorText: function () {
            return this.$el.find("#error-message");
        },

        clearErrorText: function () {
            var element = this.findErrorText();
            element.html("");
            element.removeClass("active");
        },

        addErrorText: function (message, options) {
            var element = this.findErrorText();
            element.html(element.html() + message);
            element.addClass("active");
            element.addClass("alarm");
        }




    });

    app.pluginManager.addObject(editHouseholdPage);

})(jQuery, window, document);