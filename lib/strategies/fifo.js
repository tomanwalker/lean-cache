"use strict";

// ## export
module.exports = function(options, argStorage){
	
	// initialize
	var _this = this;
	this.options = options;
	var storage = argStorage;
	
	// methods
	this.set = function(key, obj){
		
		// remove Head
		var sizeDiff = ( storage.count + 1) - this.options.size;
		for(var i=0; i < sizeDiff; i++){
			storage.remove();
		}
		
		// add to Tail
		storage.add(key, obj);
		return true;
	};
	this.get = function(key){
		return storage.table[key];
	};
	
	this.cleanup = function(currentTime, removeHook){
		while( storage.list.head ){
			
			var headObj = storage.table[storage.list.head];
			var headTime = new Date( headObj.added.getTime() );
			var headExpiery = new Date(headTime.getTime() + (_this.options.ttl * 1000));
			var headDiff = headExpiery - currentTime;
			
			if( headDiff > 0 ){
				// items are still up-to-date
				// break the loop
				return false; 
			}
			
			var expired = storage.remove();
			removeHook(expired);
		}
		
		return true;
	};
	
};


