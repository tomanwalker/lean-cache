"use strict";

// ## Config
var limitAdd = 1000000;
var limitRead = limitAdd / 2;
var limitDelete = 1000;

// ## Funcs
var measureLoop = function(limit, handler){
	
	var start = new Date();
	
	for(var i=0; i < limit; i++){
		handler(i);
	};
	
	var diff = (new Date()) - start;
	var memory = Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100;
	
	return [diff, memory];
};

// ## Flow
var storageClass = require('../lib/storage.js');
var benchmark = [];
var storage = new storageClass();
console.log('*** Start - storageLoad.js ***');

// ## Add
var resultAdd = measureLoop(limitAdd, function(i){
	benchmark.push({
		key: ('a' + i)
	});
});
var resultAddComp = measureLoop(limitAdd, function(k){
	storage.add(('b'+ k), {
		key: ('b'+ k)
	});
});
console.log('>>> TimeAdd - benchmark 	- n = %s | t = %s ms | mem = %s mb', limitAdd, resultAdd[0], resultAdd[1]);
console.log('>>> TimeAdd - storage 		- n = %s | t = %s ms | mem = %s mb', limitAdd, resultAddComp[0], resultAddComp[1]);

// ## Reads
var resultReadA = measureLoop(limitRead, function(i){
	var temp = benchmark[i];
});
var resultReadB = measureLoop(limitRead, function(i){
	var temp = storage.table[i];
});
console.log('>>> TimeRead - benchmark	- n = %s | t = %s ms | mem = %s mb', limitRead, resultReadA[0], resultReadA[1]);
console.log('>>> TimeRead - storage		- n = %s | t = %s ms | mem = %s mb', limitRead, resultReadB[0], resultReadB[1]);

// ## Deletes
var resultDeleteA = measureLoop(limitDelete , function(i){
	var temp = benchmark.shift();
	temp = null;
});
var resultDeleteB = measureLoop(limitDelete , function(i){
	var temp = storage.remove();
	temp = null;
});
console.log('>>> TimeDelete - benchmark	- n = %s | t = %s ms | mem = %s mb', limitDelete, resultDeleteA[0], resultDeleteA[1]);
console.log('>>> TimeDelete - storage	- n = %s | t = %s ms | mem = %s mb', limitDelete, resultDeleteB[0], resultDeleteB[1]);

// ## GC
if (global.gc) {
	global.gc();
} else {
	console.warn('No GC hook! Start your program as `node --expose-gc file.js`.');
}

setTimeout(function(){
	if (global.gc) {
		global.gc();
	} else {
		console.warn('No GC hook! Start your program as `node --expose-gc file.js`.');
	}
	
	var memory = Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100;
	console.log('>>> Garbage collector - mem = %s mb', memory);
	
}, 1000);


