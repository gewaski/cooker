Promise = require("promise");
function sleep(delay){ 
    return function(){ 
        return new Promise(function(resolve, reject){ 
            setTimeout(resolve, delay); 
        }); 
    } 
} 

var promise = new Promise(function(resolve){ 
    console.log('do something'); resolve(); 
})
.then(sleep(2000))
.then(function(){ 
    console.log('after sleep 2000'); 
});

console.log("end");

