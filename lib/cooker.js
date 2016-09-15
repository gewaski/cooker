/*
 * Copyright(c) 2016 zhangwei13 <alucard.hust@gmail.com>
 * 
 * Cooker
 *
 * MIT License
 */

// open with actions in sequence
function openWithActions(url, page) {

    openArguments = arguments;

    page.open(url, function(status) {
    
        var requestIds = [];
        page.onResourceRequested = function(request, networkRequest) {
            requestIds.push(request.id);
//            console.log("all request size: " + requestIds.length);
        };
    
        page.onResourceReceived = function(response) {
            var index = requestIds.indexOf(response.id);
            requestIds.splice(index, 1);
//            console.log("all request size: " + requestIds.length);
        };
    
        page.onLoadStarted = function() {
            console.log('Load Started');
        };
    
        page.onError = function(msg, trace) {
            console.log('Load error: ' + msg);
            page.render("error.png");
            phantom.exit();
        };
    
        page.onConsoleMessage = function(msg, lineNum, sourceId) {
            console.log('CONSOLE: ' + msg);
        };
    
        // wait silent and run, rc = result container
        function runAndCheckSilent(action, rc) {
            setTimeout(function(){
                var readyState = page.evaluate(function () {
                    return document.readyState;
                });
                if ("complete" === readyState && requestIds.length === 0) {
                    action();
                    rc.pop();
                } else {
                    runAndCheckSilent(action, rc);
                }
            }, 100);
        }
    
        // run multi actions in sequence
        function runActions(actions, index) {
    
            var rc = new Array();
            rc.push(1);
    
            var action = actions[index];
            var hasNext = false;
            if (index < (actions.length-1)) {
                hasNext = true;
            }
    
            runAndCheckSilent(action, rc);
    
            var interval = setInterval(function () {
                if (rc.length === 0) {
                    console.log("current action done: " + action.name);
                    clearInterval(interval);
                    if (hasNext) {
                        console.log("try to trigger next action: " + actions[index+1].name);
                        runActions(actions, index+1);
                    }
                }
            }, 1);
        }
    
        // add exit action
        var finalActions = [];
        for(var i=2; i<openArguments.length; i++) {
            finalActions.push(openArguments[i]);
        }
        runActions(finalActions, 0);
    });
}

module.exports.openWithActions = openWithActions;
