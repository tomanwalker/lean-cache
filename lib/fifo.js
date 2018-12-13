"use strict";

var StorageClass = require('./storage.js');

// ## export
module.exports = function(options){
	
	// initialize
	this.options = options;
	
	// fields
	var _this = this;
	var storage = new StorageClass(options.size);
	
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
			var removed = storage.list.remove();
			delete storage.table[removed.key];
		}
		
		// add to Tail
		storage.table[key] = obj;
		storage.list.add(obj);
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
	
};


