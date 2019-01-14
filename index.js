"use strict";

// Alex Shkunov - 2018 - Initial implmentation

// ## constants
var DEFAULT_OPTIONS = {
	size: 100000, // 100k records max
	ttl: (60 * 60), // 1 hour
	iterval: 60, // 1 minute
	strategy: 'fifo', // First in first out
	load: null // Where to get missing data
};

// ## export
module.exports = function(argumentOptions){
	
	// initialize
	var defaultOpts = Object.create(DEFAULT_OPTIONS);
	var optionsToUse;
	
	if( !argumentOptions ){
		// just use the defaults
		optionsToUse = defaultOpts;
	}
	else{
		var validationMessage = validateInputConstructor(argumentOptions);
		if(validationMessage){
			throw validationMessage;
		}
		
		optionsToUse = {};
		for(var p in defaultOpts){
			optionsToUse[p] = (argumentOptions[p]) ? argumentOptions[p] : defaultOpts[p];
		}
	}
	
	var _this = this;
	var StorageClass = require('./lib/' + 'storage.js');
	var StrategyClass = require('./lib/strategies/' + optionsToUse.strategy);
	var storage = new StorageClass(optionsToUse.size);
	var strategyInstance = new StrategyClass(optionsToUse, storage);
	
	this.statsHolder = {};
	
	// methods
	this.tail = function(){
		return storage.table[storage.list.tail].value;
	};
	this.head = function(){
		return storage.table[storage.list.head].value;
	};
	this.keys = function(){
		return Object.keys(storage.table);
	};
	this.elements = function(){
		return storage.elements();
	};
	this.count = function(){
		return storage.count;
	};
	
	this.set = function(key, value){
		var obj = {
			key: key,
			added: new Date(),
			useCount: 0,
			value: value
		};
		return strategyInstance.set(key, obj);
	};
	this.getAsync = function(id, callback){
		
		if( storage.table[id] ){
			return callback(null, strategyInstance.get(id).value);
		}
		else if( !optionsToUse.load ){
			return callback('load function undefined', null);
		}
		else {
			
			//Load from remote
			optionsToUse.load(id, function(err, result){
				
				_this.set(id, result);
				return callback(err, strategyInstance.get(id).value);
			});
			
		}
	};
	this.get = function(id, callback){
		
		if( typeof(callback) !== 'function' ){
			callback = function(){};
		}
		
		return this.getAsync(id, callback);
	};
	this.stats = function(){
		
		var statsObj = {
			count: storage.count,
			strategy: optionsToUse.strategy,
			head: null,
			headAdded: null,
			tail: null,
			tailAdded:null,
			lastInterval: _this.statsHolder.lastInterval,
			lastExpiredCount: _this.statsHolder.lastExpiredCount,
			lastExpiredAdded: _this.statsHolder.lastExpiredAdded,
		};
		
		if( storage.count > 0 ){
			statsObj.head = storage.list.head;
			statsObj.headAdded = storage.table[storage.list.head].added;
			statsObj.tail = storage.list.tail;
			statsObj.tailAdded = storage.table[storage.list.tail].added;
		}
		
		return statsObj;
	};
	
	if( optionsToUse.iterval > 0 ){
		this.interval = setInterval(function(){
			
			var currentTime = new Date();
			_this.statsHolder.lastInterval = currentTime.toISOString();
			_this.statsHolder.lastExpiredCount = 0;
			
			strategyInstance.cleanup(currentTime, _this.statsHolder);
			
		}, (optionsToUse.iterval * 1000));
	}
};

// ## static functions
var validateInputConstructor = function(opts){
	
	// 5m
	if( typeof(opts.size) !== 'undefined' && (opts.size < 0 || opts.size > 5000000) ){
		return {
			message:'<size> should be a Number between 0 & 5000000',
			attribute:'size',
			input: opts.size
		};
	}
	// 30 days
	if( typeof(opts.ttl) !== 'undefined' && (opts.ttl < 0 || opts.ttl > 2592000) ){
		return {
			message:'<ttl> should be a Number of seconds between 0 & 2592000 (30 days)',
			attribute: 'ttl',
			input: opts.ttl
		};
	}
	
	return null;
};


