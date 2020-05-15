
// ## dependencies
var log = require('debug')('lean-cache');

// ## config

// ## export
module.exports = function(ttl, interval, storage, strategy, stats, callback){
	
	log('cleaner.init - start - ttl = %s | interval = %s', ttl, interval);
	
	// ### props
	var _this = this;
	this.storage = storage;
	this.strategy = strategy;
	this.stats = stats;
	
	this.ttl = ttl;
	this.interval = interval;
	this.callback = callback;
	this.runner = null;
	
	// ### config
	if( this.interval > 0 && !this.storage.expiery ){
		
		var updateExpiredStats = function(expiredObj){
			_this.stats.lastExpiredCount++;
			_this.stats.lastExpiredAdded = expiredObj.added.toISOString();
			_this.stats.lastExpiredRemoved = (new Date()).toISOString();
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
		
		this.runner = setInterval(function(){
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
	}
};


