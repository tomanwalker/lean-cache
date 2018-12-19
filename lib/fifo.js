"use strict";

var StorageClass = require('./storage.js');

// ## export
module.exports = function(options, argStorage){
	
	// initialize
	this.options = options;
	
	// fields
	var _this = this;
	var storage = argStorage;
	
	// props
	this.lastInterval = '';
	this.lastExpiredCount = 0;
	
	// methods
	this.tail = function(){
		return storage.list.tail.value;
	};
	this.head = function(){
		return storage.list.head.value;
	};
	this.keys = function(){
		return Object.keys(storage.table);
	};
	this.count = function(){
		return storage.count;
	};
	
	this.set = function(key, value){
		var obj = {
			key: key,
			added: new Date(),
			value: value
		};
		
		// remove Head
		var sizeDiff = (this.count() + 1) - this.options.size;
		for(var i=0; i < sizeDiff; i++){
			storage.remove();
		}
		
		// add to Tail
		storage.add(key, obj);
		return true;
	};
	
	this.getAsync = function(id, callback){
		
		if( storage.table[id] ){
			return callback(null, storage.table[id].value);
		}
		
		if( !this.options.load ){
			return callback('load function undefined', null);
		}
		
		//Load from remote
		this.options.load(id, function(err, result){
			
			_this.set(id, result);
			return callback(err, result);
		});
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
			strategy: _this.options.strategy,
			head: null,
			headAdded: null,
			tail: null,
			tailAdded:null,
			lastInterval: _this.lastInterval,
			lastExpiredCount: _this.lastExpiredCount,
			lastExpiredAdded: _this.lastExpiredAdded,
		};
		
		if( storage.count > 0 ){
			statsObj.head = storage.list.head.key;
			statsObj.headAdded = storage.list.head.added;
			statsObj.tail = storage.list.tail.key;
			statsObj.tailAdded = storage.list.tail.added;
		}
		
		return statsObj;
	};
	
	if( this.options.iterval > 0){
		
		this.interval = setInterval(function(){
			
			var currentTime = new Date();
			_this.lastInterval = currentTime.toISOString();
			_this.lastExpiredCount = 0;
			
			while( storage.list.head ){
				
				var headTime = new Date(storage.list.head.added.getTime());
				var headExpiery = new Date(headTime.getTime() + (_this.options.ttl * 1000));
				var headDiff = headExpiery - currentTime;
				
				if( headDiff > 0 ){
					// items are still up-to-date
					// break the loop
					return true; 
				}
				
				var expired = storage.remove();
				_this.lastExpiredCount++;
				_this.lastExpiredAdded = expired.added.toISOString();
			}
			
		}, (this.options.iterval * 1000));
	}
	
};


