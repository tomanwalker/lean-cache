

// ## target
var target = 'lru-cache';
var CacheClass = require(target);

var u = require('./common');

// ## Flow
console.log('*** Benchmark start - target = %s', target);

console.log('*** Benchmark limits - add = %s | read = %s | delete = %s', 
	u.limitAdd, u.limitRead, u.limitDelete);

var myCache = new CacheClass({ 
	max: u.limitAdd,
	maxAge: 1000 * 60 * 60,
	stale: false // return 'undefined' for Expired
});

// ## Idle
var resultIdle = u.measureLoop(1, function(x){
	var idle = x + 2;
});
console.log('>>> Idle - %s 	- mem = %s mb', target, resultIdle[1]);

// ## Add
var resultAdd = u.measureLoop(u.limitAdd, function(i){
	myCache.set(
		('a' + i),
		{ name: ('a'+ i) }
	);
});
console.log('>>> TimeAdd - %s 	- n = %s | t = %s ms | mem = %s mb', target, u.limitAdd, resultAdd[0], resultAdd[1]);

// ## Reads
var resultReadA = u.measureLoop(u.limitRead, function(i){
	var temp = myCache.get( ('a' + i) );
});
console.log('>>> TimeRead - %s	- n = %s | t = %s ms | mem = %s mb', target, u.limitRead, resultReadA[0], resultReadA[1]);

// ## Deletes
var resultDeleteA = u.measureLoop(u.limitDelete , function(i){
	var temp = myCache.del( ('a' + i) );
	temp = null;
});
console.log('>>> TimeDelete - %s	- n = %s | t = %s ms | mem = %s mb', target, u.limitDelete, resultDeleteA[0], resultDeleteA[1]);





