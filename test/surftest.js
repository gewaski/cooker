/*
 * Copyright(c) 2016 zhangwei13 <alucard.hust@gmail.com>
 * 
 * MIT License
 */

var surf = require("../lib/Surf").create();
var url="http://tieba.baidu.com";
var commonHrefInfos = [];
var specialHrefInfos = [];


function findHrefs() {
    result = surf.page.evaluate(function(){
        var hrefElements = document.querySelectorAll('a[href]');
        var reg = new RegExp("^http");
        var xys1=[];
        var xys2=[];
        var ele1=[];
        var ele2=[];
        for(var i=0; i<hrefElements.length; i++) {
            var element=hrefElements[i];
            var xy = {};
            var href = element.href;
            var rect = element.getBoundingClientRect();
            xy.rect = rect;
            xy.id = element.id;
            xy.href = href;
            xy.innerHTML = element.innerHTML;
            xy.name = element.name;
            xy.index = i;
            if (0 == rect.top && 0 == rect.left && 0 == rect.height && 0 == rect.width) {
                continue;
            }
            if (reg.test(href)) {
                xys1.push(xy);
                ele1.push(element);
            } else {
                xys2.push(xy);
                ele2.push(element);
            }
        }
        return [xys1, xys2];
    });
    commonHrefInfos = result[0];
    specialHrefInfos = result[1];
}

function printHrefs() {
    var commonIndice = [];
    var specialIndice = [];
    for(var i=0; i<commonHrefInfos.length; i++) {
        commonIndice.push(commonHrefInfos[i].index);
    }
    for(var i=0; i<specialHrefInfos.length; i++) {
        specialIndice.push(specialHrefInfos[i].index);
    }
    console.log("common hrefs:   " + JSON.stringify(commonHrefInfos));
    console.log("special hrefs:  " + JSON.stringify(specialHrefInfos));
    console.log("common indice:  " + JSON.stringify(commonIndice));
    console.log("special indice: " + JSON.stringify(specialIndice));
}

function buildClickSteps(surf, afterClickAction, clickCommon, clickSpecial) {

    clickCommon = clickCommon || true;
    clickSpecial = clickSpecial || true;

    function SendClick(xy, isHttpHref) {
        this.go = function() {
            var rect = xy.rect;
            var name = xy.name;
            var href = xy.href;
            console.log("^^^^^^^^^ click: " + JSON.stringify(xy));

            if (isHttpHref) {
                surf.page.open(href);
            } else {
                surf.page.evaluateJavaScript("\
                    function() { \
                        var hrefElements = document.querySelectorAll('a[href]'); \
                        var a = hrefElements[" + xy.index + "]; \
                        if (null != a) { \
                            var e = document.createEvent('MouseEvents'); \
                            e.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null); \
                            a.dispatchEvent(e); \
                        } \
                    }");
            }
           //surf.page.sendEvent('click', rect.left + rect.width / 2, rect.top + rect.height / 2);
        };
    }

    function AfterClick(xy) {
        this.go = function() {
            afterClickAction(xy);
        };
    }

    var funcs = [];
    clickSteps = function(xys, isHttpHref){
        for(var i=0; i<xys.length; i++) {
            var xy=xys[i];
            var name = "[name]=" + xy.name + ",[index]=" + xy.index;
            sendClick = new SendClick(xy, isHttpHref);
            surf.want(sendClick.go, 1000, "sendClick" + name);
            if (typeof afterClickAction == "function") {
                afterClick = new AfterClick(xy);
                surf.want(afterClick.go, 1000, "afterClick" + name);
            }
            surf.want(function(){
                surf.page.goBack();
            }, 1000, "goBack" + name);
        }
    }

    if (clickCommon) {
       clickSteps(commonHrefInfos, true);
    }

    if (clickSpecial) {
        clickSteps(specialHrefInfos, false);
    }

    console.log("done build");
}

function end() {
    phantom.exit();
}

surf.open(url);
surf.want(findHrefs, 1, "findHrefs");
surf.want(printHrefs, 1, "printHrefs");
surf.addBatchActions(
        function(markDone){
            buildClickSteps(
                surf, 
                function(xy) {
                    var rect = xy.rect;
                    var pngname = rect.left + "_" + rect.top + "_" + rect.width + "_" + rect.height + ".png";
                    console.log(pngname + " ====== " + surf.page.url);
                    surf.page.render(pngname);
                }, 
                true, 
                true);
            markDone.done();
        }, 1, "buildClickSteps");
//surf.want(end, 1, "end");

