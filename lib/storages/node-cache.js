
// ## dependencies
var NodeCache = require( "node-cache" );
var log = require('debug')('lean-cache');

// ## export
module.exports = function(size, ttl, interval){
	
	// <size> unused, Node-cache only limits time
	// <size> present for compatibility with other storage classes
	
	log('node-cache.init - start - size = %s | ttl = %s | interval = %s',
		size, ttl, interval );
	
	// ### props
	var _this = this;
	this.instance = new NodeCache({ 
		stdTTL: ttl,
		checkperiod: interval
	});
	this.count = 0;
	this.expiery = true; // the storage type has own Expiery mechanism
	
	// ### config
	this.instance.on( "del", function( key, val ){
		var date = new Date();
		var diff = date - val.added;
		
		log('node-cache.on - delete - key = %s | diff = %s | ts = %s | added = %s', 
			key, diff, date.toISOString(), val.added.toISOString());
		
		_this.count--;
		
	});
	
	// ### methods
	this.add = function(key, val){
		log('node-cache.add - start - key = %s', key);
		_this.instance.set(key, val);
		_this.count++;
		
	};
	
	this.get = function(key){
		log('node-cache.get - start - key = %s', key);
		_this.instance.get( key );
	};
	this.keys = function(){
		return _this.instance.keys();
	};
	this.tail = function(){
		var k = _this.keys();
		return _this.instance.get( k[k.length - 1] ).value;
	};
	this.head = function(){
		return _this.instance.get( _this.keys()[0] ).value;
	};
	
};


