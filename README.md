# flexi-cache
Flexible and customizable in-memory cache

[![Build Status](https://travis-ci.org/AlexShkunov/flexi-cache.svg?branch=master)](https://travis-ci.org/AlexShkunov/flexi-cache)


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

