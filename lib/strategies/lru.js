
// ## dependencies
var log = require('debug')('lean-cache');

// ## export
module.exports = function(options, argStorage){
	
	// initialize
	var _this = this;
	this.options = options;
	var storage = argStorage;
	
	// methods
	this.set = function(key, obj){
		
		log('lru.set - start - key = %s | cnt = %j', key, storage.count);
		
		// remove From Tail
		// cause Tail contains Least Used Item
		var sizeDiff = (storage.count + 1) - this.options.size;
		for(var i=0; i < sizeDiff; i++){
			var removed = storage.pop();
			log('lru.set - removed - key = %s | used = %s', removed.key, removed.useCount);
		}
		
		// add to Tail
		storage.add(key, obj);
		
		return true;
	};
	this.get = function(key){
		var target = storage.get(key);
		log('lru.get - start - key = %s | val = %j', key, target);
		
		if( !target ){
			return null;
		}
		
		target.useCount += 1;
		
		var replace_condition = ( 
			storage.count > 1 
			&& target.prev 
			&& target.useCount > storage.table[target.prev].useCount
		);
		
		log('lru.get - replace.before - count = %s | key = %s | key.use = %s | prev = %s | cond = %s', 
				storage.count, key, target.useCount, target.prev, replace_condition);
		if( replace_condition ){
			log('lru.get - replace - count = %s | key = %s | key.use = %s | prev = %s | prev.use = %s', 
				storage.count, key, target.useCount, target.prev, storage.table[target.prev].useCount);
			
			storage.list.swap(key, target.prev);
		}
		
		return target.value;
	};
	
};


