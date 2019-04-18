"use strict";

// Alex Shkunov - 2018 - Initial implmentation

// ## dependencies
var validator = require('./lib/validator');

// ## constants
var DEFAULT_OPTIONS = {
	size: 100000, // 100k records max
	ttl: (60 * 60), // 1 hour
	iterval: 600, // 10 minutes
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
		var validationMessage = validator.validateInputConstructor(argumentOptions);
		if(validationMessage){
			throw validationMessage;
		}
		
		optionsToUse = {};
		for(var p in defaultOpts){
			optionsToUse[p] = (argumentOptions[p]) ? argumentOptions[p] : defaultOpts[p];
		}
	}
	
	var _this = this;
	this.statsHolder = {};
	
	var StorageClass = require('./lib/' + 'storage.js');
	var storage = new StorageClass(optionsToUse.size);
	var StrategyClass;
	
	if( typeof(optionsToUse.strategy) === 'string' ){
		StrategyClass = require('./lib/strategies/' + optionsToUse.strategy);
	}
	else {
		StrategyClass = optionsToUse.strategy;
	}
	var strategyInstance = new StrategyClass(optionsToUse, storage);
	
	// methods
	this.count = function(){
		return storage.count;
	};
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
				if(err){
					return callback(err, null);
				}
				else {
					_this.set(id, result);
					return callback(null, strategyInstance.get(id).value);
				}
			});
			
		}
	};
	this.get = function(id, callback){
		
		if( typeof(callback) !== 'function' ){
			callback = function(){};
		}
		
		return this.getAsync(id, callback);
	};
	this.del = function(id){
		return storage.removeByKey(id);
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
			lastExpiredRemoved: _this.statsHolder.lastExpiredRemoved,
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
		
		var updateExpiredStats = function(expiredObj){
			_this.statsHolder.lastExpiredCount++;
			_this.statsHolder.lastExpiredAdded = expiredObj.added.toISOString();
			_this.statsHolder.lastExpiredRemoved = (new Date()).toISOString();
		};
		var basicCleanup = function(currentTime, removeHook){
			for(var k in storage.table){
				var obj = storage.table[k];
				var objTime = new Date( obj.added.getTime() );
				var objExpiery = new Date(objTime.getTime() + (optionsToUse.ttl * 1000));
				var objDiff = objExpiery - currentTime;
			
				if( objDiff <= 0 ){
					storage.removeByKey(k);
					removeHook(obj);
				}
			}
			
			return true;
		};
		
		this.interval = setInterval(function(){
			
			var currentTime = new Date();
			_this.statsHolder.lastInterval = currentTime.toISOString();
			
			if( storage.count > 0 ){
				_this.statsHolder.lastExpiredCount = 0;
				
				if( typeof(strategyInstance.cleanup) === 'function'){
					return strategyInstance.cleanup(currentTime, updateExpiredStats);
				}
				else{
					return basicCleanup(currentTime, updateExpiredStats);
				}
			}
			
		}, (optionsToUse.iterval * 1000));
	}
};


