/*
 * Copyright(c) 2016 zhangwei13 <alucard.hust@gmail.com>
 * 
 * Cooker
 *
 * MIT License
 */

var cooker = require("../lib/cooker").create();
cooker.on();
cooker.addAction(function(markDone){console.log("111"); markDone.done();}, 100, 1);
cooker.addAction(function(markDone){console.log("222"); markDone.done();}, 100, 2);
cooker.addAction(function(markDone){console.log("333"); markDone.done();}, 100, 3);
cooker.addAction(function(markDone){console.log("444"); markDone.done();}, 100, 4);
cooker.addAction(function(markDone){console.log("555"); markDone.done();}, 100, 5);
cooker.addAction(function(markDone){console.log("666"); markDone.done();}, 100, 6);
cooker.addAction(function(markDone){console.log("777"); markDone.done();}, 100, 7);
cooker.addAction(function(markDone){console.log("wait 3 seconds by addAction"); setTimeout(function(){markDone.done()}, 3000);}, 100, "wait3byaddAction");
cooker.addAction(function(markDone){console.log("888"); markDone.done();}, 100, 8);
flag = false;
cooker.addAction(function(markDone){console.log("mark flag=true after 3 seconds"); setTimeout(function(){flag=true;},3000); markDone.done();}, 100, "markFlagAfter3Seconds");
cooker.addCheckAction(
        function(){
            console.log("i'm free");
        }, 100, "wait3byaddCheckAction", function(){return flag;}, 10);
cooker.addActions(function(markDone){console.log("addActions test"); markDone.done();}, 100, "addActions");
cooker.addActions(function(markDone){console.log("addActions invalid test"); markDone.done();});
cooker.addAction(function(markDone){cooker.off(); markDone.done();}, 100, 9);
