"use strict";

// ## export
module.exports = function(options, argStorage){
	
	// initialize
	var _this = this;
	this.options = options;
	var storage = argStorage;
	
	// methods
	this.set = function(key, value){
		var obj = {
			key: key,
			added: new Date(),
			useCount: 0,
			value: value
		};
		
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
		var target = storage.table[key];
		target.useCount += 1;
		
		if( storage.count > 1 && target.useCount > target.prev.useCount){
			
			console.log('lru.get - target - id = %s | use = %s', target.key, target.useCount, );
			console.log('lru.get - prev  - id = %s | use = %s', target.prev.key, target.prev.useCount);
			
			var tempNext = target.next;
			var tempPrev = target.prev.prev;
			
			target.next = target.prev.next;
			target.prev.next = tempNext;
			
			target.prev.prev = target.prev;
			target.prev = tempPrev;
		}
		
		return target;
	};
	
	this.cleanup = function(currentTime, statsHolder){
		while( storage.list.head ){
			
			var headTime = new Date(storage.list.head.added.getTime());
			var headExpiery = new Date(headTime.getTime() + (_this.options.ttl * 1000));
			var headDiff = headExpiery - currentTime;
			
			if( headDiff > 0 ){
				// items are still up-to-date
				// break the loop
				return false; 
			}
			
			var expired = storage.remove();
			statsHolder.lastExpiredCount++;
			statsHolder.lastExpiredAdded = expired.added.toISOString();
		}
		
		return true;
	};
	
};


