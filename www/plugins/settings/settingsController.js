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
    

    // The actual plugin constructor
    function controller() {
        //console.log("settings controller");
        this._page = null;
    };

    controller.prototype.init = function (options) {
        //console.log("settings controller init");
        //this._page = app.view.getPage("page-settings");
        //var pageElement = this._page.$el;
        //this._page.controller(this);
        
                
        $("#reset-button").on("click",this.onReset.bind(this));
        $("#load-form-list-button").on("click",this.onLoad.bind(this));
        $("#debug-button").on("click",this.onDebug.bind(this));

        app.controller.setControllerByModel("settings", this);
    };
    
    controller.prototype.onLoad = function(evt) {
        app.onLoad();
    };
    
    controller.prototype.onReset = function(evt) {
        app.onReset();
    };
    
    controller.prototype.onDebug = function(evt) {
        app.onDebug();
    };

    app.pluginManager.addObject(controller);
    app.pluginManager.addController("settingsController",controller);

})(jQuery, window, document);