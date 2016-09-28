/*
 * Copyright(c) 2016 zhangwei13 <alucard.hust@gmail.com>
 * 
 * MIT License
 */

function Surf(fakePhone, disableImage) {

    var cooker = require("./cooker").create();
    var page = require('webpage').create();
    var requestIds = [];
    var loading = [];
    var opened= false;

    this.page = page;
    this.open = open;
    this.want = want;
    this.addAction = addAction;
    this.addBatchActions = addBatchActions;
    this.addCheckAction = addCheckAction;
    this.clickBySelector = clickBySelector;

    if (fakePhone) {
        page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.120 Safari/537.36';
    }

    if (disableImage) {
        page.settings.loadImages = false;
    }

    cooker.on();

    page.onResourceRequested = function(request, networkRequest) {
        requestIds.push(request.id);
        //console.log("all request size: " + requestIds.length);
    };

    page.onResourceReceived = function(response) {
        var index = requestIds.indexOf(response.id);
        requestIds.splice(index, 1);
        //console.log("all request size: " + requestIds.length);
    };

    page.onLoadStarted = function() {
        loading.push(1);
        console.log('Load Started');
    };

    page.onLoadFinished = function(status) {
        loading.pop();
        console.log('Load finished');
    };

    page.onError = function(msg, trace) {
        //console.log('Load error: ' + msg);
        //page.render("error.png");
    };
        
    page.onConsoleMessage = function(msg, lineNum, sourceId) {
        //console.log('CONSOLE: ' + msg);
    };


    /*
     * checkFunc for surf
     */
    function SurfCheckFunc(page, name, requestIds, loading) {
    
        this.checkFunc = checkFunc;
        var TIMEOUT = 10000;
        var startCheckTime = null;
    
        function checkFunc() {
            if (null == startCheckTime) {
                startCheckTime = new Date().getTime();
            }
            var readyState = page.evaluate(function () {
                return document.readyState;
            });
    
            var r1 = "complete" == readyState;
            var r2 = 0 == requestIds.length;
            var r3 = 0 == loading.length;
            var isWebLoadDone = r1 && r2 && r3;
            console.log("------[surfCheckFunc - webLoadDone]:\t" + r1 + "\t" + r2 + "\t" + r3 + "\t" + name);
            var now = new Date().getTime();
            var delta = now - startCheckTime;
            if (delta > TIMEOUT) {
                console.log("------[surfCheckFunc - webLoadDone]:\ttimeout millseconds " + delta + " for " + name);
                isWebLoadDone = true;
            }
            return isWebLoadDone;
        }
    }

    function want(action, sleep, name) {
        console.log("------[surf want]: " + name);
        surfCheckFunc = new SurfCheckFunc(page, name, requestIds, loading);
        cooker.addCheckAction(action, sleep, name, surfCheckFunc.checkFunc, 500);
    }

    function addAction(action, sleep, name) {
        console.log("------[surf addAction]: " + name);
        cooker.addAction(action, sleep, name);
    }

    function addBatchActions() {
        if (arguments.length%3 != 0) {
            console.log("------[surf addBatchActions]: invalid arguments: [action1, action1SleepMills, action1Name, action2, action2SleepMills, action2Name ...]");
            return;
        }

        for (var i=0; i<arguments.length; i+=3) {
            console.log("------[surf addBatchActions]: " + arguments[i+2]);
        }

        cooker.addBatchActions.apply(this, [].slice.call(arguments));
    }

    function addCheckAction(action, sleep, name, checkFunc, checkInterval) {
        console.log("------[surf addCheckAction]: " + name);
        addCheckAction(action, sleep, name, checkFunc, checkInterval);
    }

    function open(url) {
        
        console.log("open url: " + url);

        // openPage
        want(function(){openPage(url);}, 10, "_openPage");

        // check ifOpened
        cooker.addCheckAction(null, 1, "_ifOpened", function(){return opened;}, 1);
    }

    function close() {
        page.close();
        opened = false;
    }

    // open page only, build context
    function openPage(url) {

        page.open(url, function(status) {
            // here, page.open is considered done for sure
            opened = true;
        });
    }

    // click by selector
    function clickBySelector(cssselect) {
        want(function() {
            page.evaluateJavaScript("function(){ \
                var e = document.createEvent('MouseEvents'); \
                e.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null); \
                document.querySelector(\"" + cssselect + "\").dispatchEvent(e); \
            }");
        }, 1, "clickBySelector:" + cssselect);
    }
}

module.exports.create = function(fakePhone, disableImage){return new Surf(fakePhone, disableImage);};
