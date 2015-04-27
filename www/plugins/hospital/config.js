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
    var plugin = [
        {
            type: "page",
            name: "hospital",
            template: "hospital.htm",
            script: "hospital.js",
            style: "hospital.css",
            classname: "hospitalPage",
            backButton: true
        },
         {
            type: "page",
            name: "edit-hospital",
            template: "editHospital.htm",
            script: "editHospital.js",
            classname: "editHospitalPage",
            backButton: true
        },
       {
            type: "model",
            name: "mHospital",
            script: "mHospital.js",
            classname: "mHospital"
        },
        {
            type: "controller",
            name: "hospitalController",
            script: "hospitalController.js",
            classname: "hospitalController"
        }
    ];
    app.pluginManager.addPlugin(plugin);
})(jQuery, window, document);