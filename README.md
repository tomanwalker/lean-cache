# lean-cache
Lean and customizable in-memory cache.
Allows to restrict cache in size as well as time. Provides different replacement strategies

[![Build Status](https://travis-ci.org/AlexShkunov/flexi-cache.svg?branch=master)](https://travis-ci.org/AlexShkunov/flexi-cache)

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
|strategy| _ | _ | fifo, lru | [more](#other)

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
'fifo' - First in First out, when <count> exceeds <size>, removes an element starting from Head
'lru' - Least Recently Used, on every get sorts elements by popularity (Tail - Least / Head - Most), when <count> exceeds <size>, removes an element starting from Tail

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
	};
	
	this.get = function(key){
		return store.table[key];
	};
};
```

## Performance
### vs array
```
$ node --expose-gc benchmark/storageLoad.js

// benchmark - Simple array
// n - amount of operations

*** Start - storageLoad.js ***
TimeAdd - benchmark 	- n = 1000000 | t = 331 ms | mem = 89.24 mb
TimeAdd - storage 		- n = 1000000 | t = 2061 ms | mem = 274.25 mb
TimeRead - benchmark	- n = 500000 | t = 3 ms | mem = 274.27 mb
TimeRead - storage		- n = 500000 | t = 3 ms | mem = 274.27 mb
TimeDelete - benchmark	- n = 1000 | t = 2087 ms | mem = 274.27 mb
TimeDelete - storage	- n = 1000 | t = 1 ms | mem = 274.28 mb
```

### vs node-cache
// to be updated


