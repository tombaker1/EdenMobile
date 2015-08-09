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

// Plugin config parameters
//
// name         - String used for page naming, and data structure keys
// type         - Type of plugin:
//                  page    - Backbone view page
//                  utility - Functional code
// template     - File path for View templates
// script       - Javascript code implementing the plugin
// style        - Plugin specific CSS code
//
// Order of loading files.  These are the values of loadState.
// 1. Config
// 2. Template
// 3. Style
// 4. Script
// 5. Complete
//

;
(function ($, window, document, undefined) {

    // Manage loading and initialization of plugins
    function pluginManager() {
        this.plugins = {};
        this.pluginLoadList = [];
        this.controllers = {};

    };

    //
    pluginManager.prototype.init = function () {
        // Connect to Backbone events
        _.extend(this, Backbone.Events);

        // Initialize all of the plugins
        this.on("plugin-load-complete", this.createPlugins.bind(this));

        this.loadPlugins();
    };

    pluginManager.prototype.createPlugins = function () {
        for (var pluginKey in this.plugins) {
            //console.log("plugin: " + pluginKey);
            var plugin = this.plugins[pluginKey];
            var config = plugin["config"];
            
            for (var i = 0; i < config.length; i++) {
                var data = config[i];
                var name = data["name"];
                var className = data["classname"];
                switch (data["type"]) {
                case "page":
                    {
                        var pageName = "page-" + name;
                        var template = data.rawData;
                        var obj = data["object"];
                       var newPage = new obj({
                            name: pageName,
                            content: template,
                            config: data
                        });
                        newPage.render();
                        app.view.addPage(pageName, newPage);
                    }
                    break;
                case "controller":
                    {
                        // Do the controller
                        //console.log("start settings");
                        var obj = this.controllers[className];
                        var controller = new obj(data);
                        this.addController(className, controller);
                        
                        // Do the model config
                        var modelClass = data["modelClass"];
                        if (modelClass) {
                            var modelType = data["modelType"];
                            var modelData = {};
                            var obj = app.controller.getModel(modelClass);
                            //obj["name"] = data["name"];
                            modelData[modelType] = obj;
                            app.controller.addModel(modelData);
                            //config["model"] = data["name"];
                        }

                    }
                    break;
                case "model":
                    {
                        var modelData = {};
                        var obj = app.controller.getModel(className);
                        //obj["name"] = data["name"];
                        modelData[name] = obj;
                        app.controller.addModel(modelData);
                        config["model"] = data["name"];
                        //plugin["model"] = data.["classname"];

                    }
                    break;
                default:
                    {
                        alert("unknown plugin type " + data["type"]);
                    }
                    break;
                }
            }
        }
        $(document).foundation();
        this.trigger("plugin-create-complete");
    };

    pluginManager.prototype.initPlugins = function () {
        // Call init for all plugin controllers
        for (var controllerName in this.controllers) {
            var controller = this.controllers[controllerName];
            if (controller.init) {
                controller.init();
            }
        }
    };

    pluginManager.prototype.loadPlugins = function () {
        //console.log("pluginManager loadPlugins");
        var pluginConfig = app.config.plugins;
        for (var key in pluginConfig) {
            var pluginSpec = pluginConfig[key];
            var name = pluginSpec["name"];
            var pluginData = _.extend(pluginSpec, {
                type: "config",
                loadState: 0,
                config: [],
                loadIndex: 0,
                configName: pluginSpec["config"]
            });

            this.pluginLoadList.push(pluginData); //{
            this.plugins[name] = pluginData;

        }

        // Initiate the download
        this.requestData();
    };

    pluginManager.prototype.requestData = function () {
        //console.log("pluginManager requestData");

        // First check to see if we are done
        if (this.pluginLoadList.length <= 0) {
            //console.log("plugin load complete");
            return;
        }


        var pluginLoading = this.pluginLoadList[0];
        var currentPlugin = this.plugins[pluginLoading.name];
        //var pluginData = currentPlugin["config"][0];
        var index = currentPlugin["loadIndex"];
        var pluginData = currentPlugin["config"][index];

        var done = false;
        var parent = $("#dynamic-load");
        while (!done) {
            pluginLoading.loadState++;
            switch (pluginLoading.loadState) {
            case 1:
                {
                    var path = "/" + pluginLoading["name"] + "/" + pluginLoading["configName"];
                    if (path) {
                        var elementString = "<script type='text/javascript'></script>"; // id='script-" +
                        var element = document.createElement('script'); //$(elementString)[0];
                        element.type = "text/javascript";
                        element.onload = this.cbLoadComplete.bind(this);
                        element.src = "plugins" + path;
                        var p = document.getElementById("dynamic-load");
                        p.appendChild(element);
                        done = true;
                    }
                }
                break;
            case 2:
                {
                    
                    if (pluginData["template"]) {
                        var path = "/" + pluginLoading["name"] + "/" + pluginData["template"];
                        var elementString = "<iframe id='data-" +
                            pluginData["name"] +
                            "' onload='app.pluginManager.cbLoadComplete()' src='plugins" +
                            path +
                            "'  style='display:none'></iframe>";
                        parent.append(elementString);
                        done = true;
                    }
                }
                break;
            case 3:
                {
                    
                    if (pluginData["style"]) {
                        var path = "/" + pluginLoading["name"] + "/" + pluginData["style"];
                        var elementString = "<link href='plugins" + path + "' rel='stylesheet' onload = 'app.pluginManager.cbLoadComplete()'>";
                        parent.append(elementString);
                        done = true;
                    }
                }
                break;
            case 4:
                {
                    
                    if (pluginData["script"]) {
                        var path = "/" + pluginLoading["name"] + "/" + pluginData["script"];
                        var elementString = "<script type='text/javascript'></script>"; // id='script-" +
                        //pluginLoading.name +
                        //"'  ></script>";
                        var element = document.createElement('script'); //$(elementString)[0];
                        element.type = "text/javascript";
                        element.onload = this.cbLoadComplete.bind(this);
                        element.src = "plugins" + path;
                        var p = document.getElementById("dynamic-load");
                        p.appendChild(element);
                        //parent.append(element);
                        done = true;
                    }
                }
                break;
            case 5:
                {
                    var plugin = this.pluginLoadList[0];
                    plugin.loadIndex++;
                    if (plugin.loadIndex < plugin.config.length) {
                        plugin.loadState = 1;
                        pluginData = currentPlugin["config"][plugin.loadIndex];
                    } else {
                        var list = this.pluginLoadList.shift();
                        if (this.pluginLoadList.length) {
                            pluginLoading = this.pluginLoadList[0];
                            currentPlugin = this.plugins[pluginLoading.name];
                            plugin.loadIndex = 0;
                        } else {
                            // All loads are done
                            done = true;
                            this.trigger("plugin-load-complete");
                        }
                    }
                }
                break;

            default:
                {
                    alert("illegal plugin loading state");
                }
                break;
            }
        }
        //}
    };

    pluginManager.prototype.cbLoadComplete = function () {
        //console.log("pluginManager cbLoadComplete");

        // Get the plugin loading info
        var pluginLoading = this.pluginLoadList[0];
        var currentPlugin = this.plugins[pluginLoading.name];
        var config = currentPlugin.config[currentPlugin.loadIndex];
        switch (pluginLoading.loadState) {
        case 1:
            {}
            break;
            // template
        case 2:
            {
                var id = "#data-" + config["name"];
                var data = $(id).contents().find("xmp").html();
                config.rawData = data;
            }
            break;

            // style
        case 3:
            {}
            break;

            // script
        case 4:
            {}
            break;


        case 5:
            {}
            break;
        };

        // Download the next file
        this.requestData();
    };


    pluginManager.prototype.getPlugin = function (key) {
        //console.log("pluginManager cbLoadComplete");
        return this.plugins[key];
    };


    pluginManager.prototype.addPlugin = function (config) {
        //console.log("pluginManager addPlugin");
        var currentPlugin = this.pluginLoadList[0];
        currentPlugin["config"] = currentPlugin["config"].concat(config);

    };

    pluginManager.prototype.addElement = function (key,value) {
        //console.log("pluginManager addController");
        var currentPlugin = this.pluginLoadList[0];
        var config = currentPlugin["config"];
        var configLoading = config[currentPlugin.loadIndex]
        configLoading[key] = value;
    };

    pluginManager.prototype.addObject = function (obj) {
        //console.log("pluginManager addController");
        var currentPlugin = this.pluginLoadList[0];
        var config = currentPlugin["config"];
        var configLoading = config[currentPlugin.loadIndex]
        configLoading["object"] = obj;
    };

    pluginManager.prototype.addController = function (name, controller) {
        //console.log("pluginManager addController");
        this.controllers[name] = controller;
    };

    pluginManager.prototype.getController = function (name) {
        return this.controllers[name];
    };

    // bind the plugin to jQuery     
    app.pluginManager = new pluginManager();

})(jQuery, window, document);