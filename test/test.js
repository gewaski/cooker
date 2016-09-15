/*
 * Copyright(c) 2016 zhangwei13 <alucard.hust@gmail.com>
 * 
 * Cooker
 *
 * MIT License
 */

cooker = require("../.");

var page = require('webpage').create();

var url="http://www.baidu.com";
var commonHrefInfos = [];
var specialHrefInfos = [];

function findHrefs() {
    result = page.evaluate(function(){
        var e = document.createEvent('MouseEvents');
        e.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        var httpArray = document.querySelectorAll('a[href]');
        var reg = new RegExp("^http");
        var xys1=[];
        var xys2=[];
        for(var i=0; i<httpArray.length; i++) {
            element=httpArray[i];
            href=element.href;
            var xy = [];
            xy[0] = element.offsetLeft;
            xy[1] = element.offsetTop;
            xy[2] = element.offsetWidth;
            xy[3] = element.offsetHeight;
            xy[4] = element.href;
            xy[5] = element.innerHTML;
            if (xy[2] == 0 && xy[3] == 0) {
                continue;
            }
            if (reg.test(href)) {
                xys1.push(xy);
            } else {
                xys2.push(xy);
            }
        }
        return [xys1, xys2];
    });
    commonHrefInfos = result[0];
    specialHrefInfos = result[1];
}

function printHrefs() {
    console.log("common hrefs:  " + JSON.stringify(commonHrefInfos));
    console.log("special hrefs: " + JSON.stringify(specialHrefInfos));
}

function buildClickSteps(afterClick, clickCommon, clickSpecial) {

    var funcs = [];
    clickSteps = function(xys){
        for(var i=0; i<xys.length; i++) {
            xy=xys[i];
            funcs.push(function(){
                page.sendEvent('click', xy[0], xy[1]);
            });
            funcs.push(afterClick(xy));
            funcs.push(function(){
                page.goBack();
            });
        }
    }

    if (clickCommon) {
       clickSteps(commonHrefInfos);
    }

    if (clickSpecial) {
        clickSteps(specialHrefInfos);
    }

    return funcs;
}

function end() {
    phantom.exit();
}

cooker.openWithActions(url, page, findHrefs, printHrefs);
end();

