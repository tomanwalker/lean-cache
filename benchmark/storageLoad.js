"use strict";

var storageClass = require('../lib/storage.js');

console.log('*** Start - storageLoad.js ***');

var benchmark = [];
var storage = new storageClass();

// ## Config
var limitAdd = 2000000;

// ## Massive add

var timeAdd = new Date();
for(var i=0; i < limitAdd; i++){
	
	benchmark.push({
		key: ('a' + i)
	});
};
var timeAddDiff = (new Date()) - timeAdd;
var timeAddMemory = Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100;
console.log('>>> TimeAdd - benchmark - n = %s | t = %s ms | mem = %s mb', limitAdd, timeAddDiff, timeAddMemory);

var timeAddComp = new Date();
for(var k=0; k < limitAdd; k++){
	
	storage.add(('b'+ k), {
		key: ('b'+ k)
	});
};
var timeAddCompDiff = (new Date()) - timeAddComp;
var timeAddCompMemory = Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100;
console.log('>>> TimeAdd - benchmark - n = %s | t = %s ms | mem = %s mb', limitAdd, timeAddCompDiff, timeAddCompMemory);

// ## Deletes


// ## Swaps


