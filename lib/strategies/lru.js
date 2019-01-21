"use strict";

// ## export
module.exports = function(options, argStorage){
	
	// initialize
	var _this = this;
	this.options = options;
	var storage = argStorage;
	
	// methods
	this.set = function(key, obj){
		
		// remove From Tail
		// cause Tail contains Least Used Item
		var sizeDiff = (storage.count + 1) - this.options.size;
		for(var i=0; i < sizeDiff; i++){
			storage.pop();
		}
		
		// add to Tail
		storage.add(key, obj);
		
		return true;
	};
	this.get = function(key){
		var target = storage.table[key];
		target.useCount += 1;
		
		if( storage.count > 1 && target.prev && target.useCount > storage.table[target.prev].useCount){
			storage.list.swap(key, target.prev);
		}
		
		return target;
	};
	
	this.cleanup = function(currentTime, removeHook){
		
		var pointer = storage.list.head;
		
		while( pointer ){
			
			var obj = storage.table[pointer];
			var objTime = new Date( obj.added.getTime() );
			var objExpiery = new Date(objTime.getTime() + (_this.options.ttl * 1000));
			var objDiff = objExpiery - currentTime;
			
			if( objDiff <= 0 ){
				
				storage.removeByKey(pointer);
				removeHook(obj);
			}
			
			pointer = obj.next;
		}
		
		return true;
	};
	
};


