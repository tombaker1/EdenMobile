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


    var userInfo = Backbone.Model.extend({
        defaults: {
            url: "",
            username: "",
            password: ""
        },

        initialize: function (options) {
            this.bind("change", function () {
                this.sync("update")
            });

        },

        getKey: function () {
            return "user-info";
        },

        sync: function (method, model, options) {
            model = this;
            options || (options = {});
            app.localSync(method, model, options);
        }
    });


    var formType = Backbone.Model.extend({
        defaults: {
            url: "",
            name: "",
            loaded: false,
            form: null,
            data: null
        },
        initialize: function () {
            //console.log("new formType name:" + this.get("name"));
        }
    });

    // create the form list item
    var mFormData = Backbone.Model.extend({

        // The construture has the superclass initialization
        // the subclasses implement initialize
        constructor: function (options) {
            console.log("mFormData constructor");

            // superclass member initialization

            this._name = "";
            this._timestamp = Date.now();
            this._needsUpdate = false;
            this._formId = "";
            this._serverState = 0; // 0 = not on server, 1 = server valid
            this._type = "";
            this._table = null;

            //if (options && options.table) {
            //    this.initData(options.type, options.table);
            //}


            // Call the original constructor
            Backbone.Model.apply(this, arguments);
        },

        initialize: function (options) {
            console.log("mFormData initialize");
        },

        submit: function () {
            console.log("sending model " + this.get("_name"));
            this.needsUpdate(true);

            // Check to see if it is a create or update
            if (this.get("uuid")) {
                this.sync('update', this, {
                    local: false
                });
            } else {
                this.sync('create', this, {
                    local: false
                });
            }
        },

        getKey: function () {
            var value = 0;
            if (this.get("uuid")) {
                value = this.get("uuid");
            } else {
                value = "timestamp:" + this.timestamp();
            }
            var prefix = "data-";
            if (this.type()) {
                prefix += this.type() + "-";
            }
            return prefix + value;
        },

        name: function (_name) {
            if (_name) {
                this.set("_name", _name);
            }
            return this.get("_name");
        },

        type: function (_type) {
            return this._type;
        },

        timestamp: function (_timestamp) {
            if (_timestamp) {
                this._timestamp = _timestamp;
            }
            return this._timestamp;
        },

        needsUpdate: function (needsUpdate) {
            if (needsUpdate != undefined) {
                this._needsUpdate = needsUpdate;
            }
            return this._needsUpdate;
        },

        sendData: function () {
            console.log("mFormData::sendData not implemented, should be overridden");
        },

        getFormData: function (table) {
            var rawData = this.get("rawData");
            var data = {};
            for (var i = 0; i < table.length; i++) {
                var tableItem = table[i];
                var name = tableItem["name"];
                if (!tableItem["form_path"]) {
                    continue;
                }
                var path = tableItem["form_path"].split("/");

                if (tableItem["reference"]) {
                    // If there is a data_path field in the table reference, then
                    // the value is referenced from another db table, and not the
                    // main record.  You must go back to the root of the download
                    // and follow the data_path
                    var referenceName = tableItem["reference"];
                    if (!rawData) {
                        continue;
                    }
                    var referenceRecord = rawData[referenceName];
                    if (!referenceRecord) {
                        data[name] = "-";
                        continue;
                    }
                    var referenceUuid = referenceRecord["@uuid"];
                    var referenceResource = referenceRecord["@resource"];
                    var serverData = app.controller.getData(this._type);
                    var referenceArray = serverData["$_" + referenceResource];
                    for (var j = 0; j < referenceArray.length; j++) {
                        var referenceItem = referenceArray[j];
                        if (referenceItem["@uuid"] === referenceUuid) {
                            if (referenceItem[name]) {
                                data[name] = referenceItem[name]["$"];
                            } else {
                                data[name] = "-";
                            }
                            break;
                        }
                    }

                    //data[name] = name;
                } else {
                    var value = undefined;
                    if (rawData && rawData[name]) {
                        value = rawData[name];
                    }
                    if (value !== undefined) {
                        var controlType = tableItem["control"];
                        switch (controlType) {
                        case "string":
                            {
                                data[name] = value;
                            }
                            break;
                         case "text":
                            {
                                data[name] = value["@value"];
                            }
                            break;
                       case "integer":
                            {
                                data[name] = value["@value"];
                            }
                            break;
                        case "select":
                            {
                                data[name] = value["@value"];
                            }
                            break;
                        default:
                            {
                                if (rawData) {
                                    var reference = rawData["$k_" + name];
                                    if (reference) {
                                        data[name] = reference["$"];
                                    } else {
                                        data[name] = undefined; //"unknown";
                                    }
                                } else {
                                    value = undefined; //"-";
                                }
                            }
                        }
                    } else {
                        if (rawData) {
                            var reference = rawData["$k_" + name];
                            if (reference) {
                                data[name] = reference["$"];
                            } else {
                                data[name] = undefined; //"unknown";
                            }
                        } else {
                            value = undefined; //"-";
                        }

                    }
                    /*
                    if (typeof value === "string") {
                        data[name] = value;
                    } else if (typeof value === "number") {
                        data[name] = value;
                    } else if (typeof value === "integer") {
                        data[name] = value;
                    } else if (name.indexOf("$_") >= 0) {
                        data[name] = value["$"];
                    } else if (typeof value === "object") {
                        data[name] = value["@value"];
                    } else {
                        if (rawData) {
                            var reference = rawData["$k_" + name];
                            if (reference) {
                                data[name] = reference["$"];
                            } else {
                                data[name] = undefined; //"unknown";
                            }
                        } else {
                            value = undefined; //"-";
                        }
                    }
                    */
                }
            }
            return data;
        },

        getTableData: function (table) {
            var rawData = this.get("rawData");
            var data = {};
            for (var i = 0; i < table.length; i++) {
                var tableItem = table[i];
                var name = tableItem["name"];
                if (!tableItem["form_path"]) {
                    continue;
                }
                var path = tableItem["form_path"].split("/");
                /*
                var dataItem = rawData;
                for (var j = 0; j < path.length; j++) {
                    dataItem = dataItem[path[j]];
                    if (!dataItem) {
                        break;
                    }
                }
                if (!dataItem) {
                    continue;
                }
                var value = dataItem[name];
                */



                if (tableItem["reference"]) {
                    // If there is a data_path field in the table reference, then
                    // the value is referenced from another db table, and not the
                    // main record.  You must go back to the root of the download
                    // and follow the data_path
                    var referenceName = tableItem["reference"];
                    if (!rawData) {
                        continue;
                    }
                    var referenceRecord = rawData[referenceName];
                    if (!referenceRecord) {
                        data[name] = "-";
                        continue;
                    }
                    var referenceUuid = referenceRecord["@uuid"];
                    var referenceResource = referenceRecord["@resource"];
                    var serverData = app.controller.getData(this._type);
                    var referenceArray = serverData["$_" + referenceResource];
                    for (var j = 0; j < referenceArray.length; j++) {
                        var referenceItem = referenceArray[j];
                        if (referenceItem["@uuid"] === referenceUuid) {
                            if (referenceItem[name]) {
                                data[name] = referenceItem[name]["$"];
                            } else {
                                data[name] = "-";
                            }
                            break;
                        }
                    }

                    //data[name] = name;
                } else {
                    var value = undefined;
                    if (rawData && rawData[name]) {
                        value = rawData[name];
                    }
                    //else if (this.get(name)) {
                    //        value = this.get(name);
                    //}
                    //else {
                    //    continue;
                    //}
                    if (typeof value === "string") {
                        data[name] = value;
                    } else if (typeof value === "number") {
                        data[name] = value;
                    } else if (name.indexOf("$_") >= 0) {
                        data[name] = value["$"];
                    } else if (typeof value === "object") {
                        data[name] = value["$"];
                    } else {
                        if (rawData) {
                            var reference = rawData["$k_" + name];
                            if (reference) {
                                data[name] = reference["$"];
                            } else {
                                data[name] = undefined; //"unknown";
                            }
                        } else {
                            value = undefined; //"-";
                        }
                    }
                }
            }
            return data;
        },

        initData: function (form, table) {
            var data = {};
            for (var i = 0; i < table.length; i++) {
                var tableItem = table[i];
                var name = tableItem["name"];
                if (!tableItem["form_path"]) {
                    continue;
                }
                var pathList = tableItem["form_path"].split("/");
                //var serverData = app.controller.getForm(this._type + "-form");
                var record = form.get("obj");
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
                    var value = "";
                    for (var j = 0; j < record.length; j++) {
                        var recordItem = record[j];
                        if (recordItem["@name"] === name) {
                            //label = recordItem["@label"];
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
                            data[name] = value;
                            break;
                        }
                    }
                } else {
                    continue;
                }

                if (tableItem["reference"]) {
                    // If there is a data_path field in the table reference, then
                    // the value is referenced from another db table, and not the
                    // main record.  You must go back to the root of the download
                    // and follow the data_path
                    var referenceName = tableItem["reference"];
                    /*
                    var referenceRecord = rawData[referenceName];
                    //var referenceUuid = referenceRecord["@uuid"];
                    //var referenceResource = referenceRecord["@resource"];
                    //var serverData = app.controller.getData(this._type);
                    //var referenceArray = serverData["$_" + referenceResource];
                    for (var j  = 0; j < referenceArray.length; j++) {
                        var referenceItem = referenceArray[j];
                        if (referenceItem["@uuid"] === referenceUuid) {
                            if (referenceItem[name]) {
                                data[name] = referenceItem[name]["value"];
                            }
                            else {
                                data[name] = "-";
                            }
                            break;
                        }
                    }
                    */
                    //data[name] = name;
                } else {
                    /*
                    var value = tableItem["value"];
                    if (typeof value === "string") {
                        data[name] = value;
                    } else if (typeof value === "number") {
                        data[name] = value;
                    } else if (name.indexOf("$_") >= 0) {
                        data[name] = value["$"];
                    } else if (typeof value === "object") {
                        data[name] = value["$"];
                    } else {
                        var reference = rawData["$k_" + name];
                        if (reference) {
                            data[name] = reference["$"];
                        } else {
                            data[name] = "unknown";
                        }
                    }
                    */
                }
            }
            this.set(data);
        }


    });

    app.controller.addModel({
        "userInfo": userInfo,
        "formType": formType,
        "mFormData": mFormData
    });


})(jQuery, window, document);