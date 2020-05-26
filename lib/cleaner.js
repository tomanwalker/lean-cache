
// ## dependencies
var log = require('debug')('lean-cache');

// ## config

// ## export
module.exports = function(ttl, interval, storage, strategy, stats, emitter){
	
	log('cleaner.init - start - ttl = %s | interval = %s | own_expiery = %s', 
		ttl, interval, storage.expiery);
	
	// ### props
	var _this = this;
	this.storage = storage;
	this.strategy = strategy;
	this.stats = stats;
	
	this.ttl = ttl;
	this.interval = interval;
	this.emitter = emitter;
	this.runner = null;
	
	// ### config
	var updateExpiredStats = function(expiredObj){
		_this.stats.lastExpiredCount++;
		_this.stats.lastExpiredAdded = expiredObj.added.toISOString();
		_this.stats.lastExpiredRemoved = (new Date()).toISOString();
		
		if( _this.emitter ){
			_this.emitter.emit('expiery', expiredObj);
		}
	};
	
	var basicCleanup = function(currentTime, removeHook){
		for(var k in _this.storage.table){
			var obj = _this.storage.table[k];
			var objTime = new Date( obj.added.getTime() );
			var objExpiery = new Date(objTime.getTime() + (_this.ttl * 1000));
			var objDiff = objExpiery - currentTime;
		
			if( objDiff <= 0 ){
				_this.storage.removeByKey(k);
				removeHook(obj);
			}
		}
		
		return true;
	};
	
	// ### func
	this.start = function(){
		
		var start_condition = (
			_this.interval > 0 
			&& !_this.storage.expiery
			&& _this.runner === null
		);
		
		if( !start_condition ){
			return false;
		}
		
		log('cleaner - activate...');
		
		_this.runner = setInterval(function(){
			var currentTime = new Date();
			var currentTimeString = currentTime.toISOString();
			_this.stats.lastInterval = currentTimeString;
			
			var before = _this.storage.count;
			log('cleaner.runner - start - time = %s', currentTimeString);
			
			if( _this.storage.count > 0 ){
				
				_this.stats.lastExpiredCount = 0;
				
				if( typeof(_this.strategy.cleanup) === 'function'){
					_this.strategy.cleanup(currentTime, updateExpiredStats);
				}
				else{
					basicCleanup(currentTime, updateExpiredStats);
				}
			}
			
			log('cleaner.runner - end - before = %s | after = %s', before, _this.storage.count);
			
		}, (this.interval * 1000) );
		
		return true;
		
	};
	
	this.stop = function(){
		
		if( _this.runner === null ){
			return false;
		}
		
		log('cleaner - deactivate...');
		
		clearInterval( _this.runner );
		_this.runner = null;
		return true;
	};
	
};


