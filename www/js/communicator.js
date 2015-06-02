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

    // create the query state
    var REQ_WAIT_TIME       = 8000;
    var REQ_WAIT_INCREMENT  = 2000;

    // The actual plugin constructor
    function communicator() {
        this._commId = 0;
        this._activeRequests = 0;
    };

    communicator.prototype.newId = function () {
        //this._commId++;
        return ++this._commId;
    };
    
    communicator.prototype.setActive = function (isActive) {
        if (isActive) {
            this._activeRequests++;
        }
        else if (this._activeRequests > 0) {
            this._activeRequests--;
        }

        return this._activeRequests;
    };

    communicator.prototype.numActive = function () {
        //this._commId++;
        return this._activeRequests;
    };

    communicator.prototype.newRequestData = function (type, url, callback, data) {

        //--------------------------------------------------------
        // State variables

        var status = true;
        var xhr = new XMLHttpRequest();
        var id = this.newId();
        var startTime = Date.now();
        //var timeoutIncrement = 2000;
        var timer = null;
        var lastTime = 0;

        //--------------------------------------------------------
        // Callbacks

        function onTimeout() {
            console.log("newRequestData: onTimeout " + id);
            app.communicator.setActive(0);
            if (app.communicator.numActive()) {
                xhr.abort();
                callback(id, false, "Server not responding");
            }
            else {
                timer = setTimeout(onTimeout,REQ_WAIT_INCREMENT);
                console.log("\tOther connections still active, resetting timer " + id);
            }
        };

        function onLoad(reply) {
            var elapsed = Date.now() - startTime;
            console.log("newRequestData: onLoad: " + id + " " + xhr.readyState + " " + xhr.status + " " + elapsed);
            var returnStatus = true;
            var message = reply.target.responseText;
            clearTimeout(timer);
            if (xhr.status != 200) {
                //callback(false, "Server error");
                //return;
                returnStatus = false;
                message = "Server Error";
            }

            if (callback) {
                //console.log("\tthat is interesting...");
                callback(id, returnStatus, message);
            }
        }

        function onError(reply) {
            console.log("newRequestData: onError");
            clearTimeout(timer);
            this.setActive(0);
        }

        function onReadyStateChange(reply) {
            if (xhr.readyState === 3) {
            var elapsed = Date.now() - startTime;
            //var newTimeout = elapsed + REQ_WAIT_INCREMENT;
            ///xhr.timeout = newTimeout;
                if (elapsed != lastTime) {
                    lastTime = elapsed;
                    clearTimeout(timer);
                    timer = setTimeout(onTimeout,REQ_WAIT_INCREMENT);
                }
            
            //console.log("newRequestData: onReadyStateChange: " + 
            //            id + " " +
            //            xhr.readyState + " " + 
            //            xhr.status + " " + elapsed);
            }
        }

        function onProgress(evt) {
            //console.log("newRequestData: onProgress: " + 
            //            id + " " + evt.loaded);
            if (evt.lengthComputable) {
                var value = (evt.loaded / evt.total) * 100;
                //console.log("\t" + value + "%");
            }
        }

        //--------------------------------------------------------
        // Main call code

        // create authentication
        var username = app.state.settings.serverInfo.get("username");
        var password = app.state.settings.serverInfo.get("password");
        var authentication = 'Basic ' + window.btoa(username + ':' + password);

        console.log("sending " + id);
        xhr.onload = onLoad;
        //xhr.ontimeout = onTimeout;
        //xhr.timeout = REQ_WAIT_TIME;
        xhr.onerror = onError;
        xhr.onreadystatechange = onReadyStateChange;
        xhr.open(type, url, true);
        xhr.setRequestHeader('Authorization', authentication);
        xhr.onprogress = onProgress;

        if (data === undefined) {
            data = null;
        }

        try {
            timer = setTimeout(onTimeout, REQ_WAIT_TIME);
            xhr.send(data);
            this.setActive(1);
        } catch (err) {
            clearTimeout(timer);
            status = false;
        }
        if (!status) {
            id = 0;
        }
        return id;
    };


    communicator.prototype.requestData = function (url) {
        return this.newRequestData("GET", url, app.controller.cbUpdateData.bind(app.controller));
    };


    communicator.prototype.submitData = function (url, cb, data) {
        return this.newRequestData("PUT", url, cb, data);
    };

    communicator.prototype.ping = function (url, cb) {
        return this.newRequestData("GET", url, cb);
    };


    communicator.prototype.requestLogin = function (url, params, cb) {
        //var formListURL = url;  // don't need to do anything here
        reqState.type = "login";
        reqState.callback = cb;
        xhr.onload = this.cbRequestLogin.bind(this);
        var boundary = '----WebKitFormBoundaryB94vneooSYjS9yn6';
        var sendText = '--' + boundary + '\r\n' +
            'Content-Disposition: form-data; name="email"\r\n' +
            '\r\n' +
            'tombaker1@gmail.com\r\n' +
            '--' + boundary + '\r\n' +
            'Content-Disposition: form-data; name="password"\r\n' +
            '\r\n' +
            'eden\r\n' +
            /* + 
                        '------WebKitFormBoundaryB94vneooSYjS9yn6\r\n' + 
                        'Content-Disposition: form-data; name="_next"\r\n' + 
                        '\r\n' +
                         '/eden/default/index\r\n' + 
                        '------WebKitFormBoundaryB94vneooSYjS9yn6\r\n' + 
                        'Content-Disposition: form-data; name="_formkey"\r\n' + 
                        '\r\n' + 
                        '7edc3829-8e35-4ad0-aeb5-d8f6f90f8d07\r\n' + 
                        '------WebKitFormBoundaryB94vneooSYjS9yn6\r\n' + 
                        'Content-Disposition: form-data; name="_formname"\r\n' + 
                        '\r\n' + 
                        'login\r\n' + 
                        '------WebKitFormBoundaryB94vneooSYjS9yn6\r\n' + 
                        'Content-Disposition: form-data; name="_utc_offset"\r\n' + 
                        '\r\n' + 
                        '480\r\n' + */
            '--' + boundary + '--\r\n';
        var newURL = url; // + "?_next=%2Feden%2Fdefault%2Findex";
        xhr.open("POST", newURL, true);
        xhr.setRequestHeader("Content-Type", 'multipart/form-data; boundary=' + boundary);
        xhr.send(sendText);
        reqTimer = setTimeout(cbReqTimeout, REQ_WAIT_TIME);

    };

    communicator.prototype.cbRequestLogin = function (reply) {
        clearTimeout(reqTimer);
        if (xhr.readyState != 4) {
            alert("What?");
            return;
        }
        if (xhr.status != 200) {
            alert("Error loading page");
            return;
        }

        // Check to see if the login succeeded
        var status = false;
        var message = "Login failed";
        var rawData = reply.target.responseText;
        var allResponses = xhr.getAllResponseHeaders();
        var index = rawData.indexOf('class="alert');
        var success = rawData.slice(index, index + 8);

        if (success.indexOf("alert-success")) {
            message = "Login succeeded";
        }
        //var responseText = xhr.getResponseHeader("SetCookie");
        //var allResponses = xhr.getAllResponseHeaders();
        //
        /*
        if (responseText) {
        var responses = responseText.split('=');
        var responseItem = responses[0].split('=');
            if ((responseItem[0] === "registered") &&
                (responseItem[1] === "yes")) {
                status = true;
            }
        }
        */

        // return and show the form
        rawData = null;
        reqState.callback(status, message);

    };

    app.communicator = new communicator();

})(jQuery, window, document);