# lean-cache
Lean and customizable in-memory cache.
Allows to restrict cache in size as well as time. Provides different replacement strategies

[![Build Status](https://travis-ci.org/AlexShkunov/lean-cache.svg?branch=master)](https://travis-ci.org/AlexShkunov/lean-cache)

## Quick start
```
var LeanCache = require('lean-cache');
// how to get new entry
var loadFunc = function(id, callback){
  db.fetch(id, callback);  
};

var opts = {
  load: loadFunc 
};
var cacheObj = new LeanCache(opts); // instance

cacheObj.get('abc', function(err, value){
    // either fetched from memory or via <loadFunc>
    // err - db error from <loadFunc>
    
    console.log('my value = %s', value);
});
```

## API
### init(opts)
```
// DEFAULT_OPTIONS
{
	size: 100000, // 100k records max
	ttl: (60 * 60), // 1 hour
	iterval: 600, // 10 minutes
	strategy: 'fifo', // First in first out
	load: null // Where to get missing data
}
```
|att|min|max|enum|comment|
|---|---|---|---|---|
|size|0|5000000| | 5 mil |
|ttl|0|2592000| | 30 days |
|interval|0|86400| | 24 hours |
|strategy| _ | _ | fifo, lru, none | [more](#other)

### .get(key, callback)
if availible - returns a value from cache,
otherwise uses <loadFunc> to fetch value (and stores it for next use)

### .set(key, value)
explicitly set the tuple

### .count()
returns amount of entries in the cache

### .stats()

```
{
	"count": 0,
	"strategy": "fifo",
	"head": null, // Key, for FiFo - the Oldest entry
	"headAdded": null, // Timestamp
	"tail": null, // Key, for FiFo - the Newest entry
	"tailAdded": null, // Timestamp
	"lastInterval": "2019-01-21T07:56:55.638Z", // Timestamp, when last check happened
	"lastExpiredCount": 5, // Number, how many entries were removed during the last check
	"lastExpiredAdded": "2019-01-21T07:56:52.642Z",
	"lastExpiredRemoved": "2019-01-21T07:56:55.638Z"
}
```

### .keys()
Array of availible keys

## other
### replacement strategy
- 'fifo' - First in First out, when <count> exceeds <size>, removes an element starting from Head
- 'lru' - Least Recently Used, on every get sorts elements by popularity (Tail - Least / Head - Most), when <count> exceeds <size>, removes an element starting from Tail
- 'none' - No replacement, elements are removed only on Time to Live basis

**custom strategy**
```
// Demonstrates "None" strategy - when <count> exceeds <size>, returns False
var custom = function(opts, storage){
	this.opts = opts;
	var store = storage;
	
	this.set = function(key, obj){
		if(store.count >= this.opts.size){
			return false; //deny
		}
		// add to Tail
		store.add(key, obj);
		return true;
	};
	
	this.get = function(key){
		return store.table[key];
	};
};

var cacheObj = new LeanCache({size:1, strategy:custom});
cacheObj.set('a', {}); //true
cacheObj.set('b', {}); //false
cacheObj.keys(); // ['a']
```

## Performance
### vs array
```
$ node --expose-gc benchmark/storageLoad.js

// benchmark - simple array
// n - amount of operations

*** Start - storageLoad.js ***
TimeAdd - 	benchmark 	- n = 1000000 	| t = 331 ms 	| mem = 89.24 mb
TimeAdd - 	storage 	- n = 1000000 	| t = 2061 ms 	| mem = 274.25 mb
TimeRead - 	benchmark	- n = 500000 	| t = 3 ms 		| mem = 274.27 mb
TimeRead - 	storage		- n = 500000 	| t = 3 ms 		| mem = 274.27 mb
TimeDelete - benchmark	- n = 1000 		| t = 2087 ms 	| mem = 274.27 mb
TimeDelete - storage	- n = 1000 		| t = 1 ms 		| mem = 274.28 mb
```

### node-cache
$ node --expose-gc benchmark/node-cache.js

*** Benchmark start - target = node-cache
*** Benchmark limits - add = 1000000 | read = 500000 | delete = 1000
>>> Idle - 			node-cache   										- mem = 6.12 mb
>>> TimeAdd - 		node-cache        	- n = 1000000 	| t = 2271 ms 	| mem = 232.75 mb
>>> TimeRead - 		node-cache       	- n = 500000 	| t = 292 ms 	| mem = 261.5 mb
>>> TimeDelete - 	node-cache     		- n = 1000 		| t = 3 ms 		| mem = 261.68 mb

### lru-cache
$ node --expose-gc benchmark/lru-cache.js

*** Benchmark start - target = lru-cache
*** Benchmark limits - add = 1000000 | read = 500000 | delete = 1000
>>> Idle - 			lru-cache    										- mem = 4.48 mb
>>> TimeAdd - 		lru-cache         	- n = 1000000 	| t = 1351 ms 	| mem = 251.22 mb
>>> TimeRead - 		lru-cache        	- n = 500000 	| t = 312 ms 	| mem = 275.93 mb
>>> TimeDelete - 	lru-cache      		- n = 1000 		| t = 1 ms 		| mem = 275.99 mb

#### comparision

| name       | add(1m) | read(500k) | remove(1k) | limit-time | limit-size | load-missing |
|------------|---------|------------|------------|------------|------------|--------------|
| lean-cache | 2061 ms | 3 ms       | 1 ms       | +          | +          | +            |
| node-cache | 2271 ms | 292 ms     | 3 ms       | +          | -          | -            |
| lru-cache  | 1351 ms | 312 ms     | 1 ms       | //.prune() | +          | -            |


