# flexi-cache
Flexible and customizable in-memory cache.
Allows to restrict cache in size as well as time. Provides different replacement strategies

[![Build Status](https://travis-ci.org/AlexShkunov/flexi-cache.svg?branch=master)](https://travis-ci.org/AlexShkunov/flexi-cache)

## Quick start
```
var FlexiCache = require('flexi-cache');
// how to get new entry
var loadFunc = function(id, callback){
  db.fetch(id, callback);  
};

var opts = {
  load: loadFunc  
};
var cacheObj = new FlexiCache(opts); // instance

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

### .get(key)

### .set(key, value)

### .count()

### .stats()

### .keys()

## other
### replacement strategy

### custom strategy

## Performance
node --expose-gc benchmark/storageLoad.js

benchmark - Simple array
n - amount of operations

*** Start - storageLoad.js ***
>>> TimeAdd - benchmark 	- n = 1000000 | t = 331 ms | mem = 89.24 mb
>>> TimeAdd - storage 		- n = 1000000 | t = 2061 ms | mem = 274.25 mb
>>> TimeRead - benchmark	- n = 500000 | t = 3 ms | mem = 274.27 mb
>>> TimeRead - storage		- n = 500000 | t = 3 ms | mem = 274.27 mb
>>> TimeDelete - benchmark	- n = 1000 | t = 2087 ms | mem = 274.27 mb
>>> TimeDelete - storage	- n = 1000 | t = 1 ms | mem = 274.28 mb

