
// ## dependencies
var log = require('debug')('lean-cache');

var validator = require('./lib/validator');
var Cleaner = require('./lib/cleaner');

// ## constants
var DEFAULT_OPTIONS = {
	size: 100000, // 100k records max
	ttl: (60 * 60), // 1 hour
	interval: 600, // 10 minutes
	strategy: 'fifo', // First in first out
	load: function(id, callback){ // Where to get missing data
		return callback('Not found = ' + id, null);
	},
	storage: 'memory' // alternative storage
};

// ## export
module.exports = function(argumentOptions){
	
	// initialize
	var defaultOpts = Object.assign({}, DEFAULT_OPTIONS);
	var optionsToUse = null;
	
	if( !argumentOptions ){
		// just use the defaults
		optionsToUse = defaultOpts;
		log('init - opts - defaults...');
		
	}
	else{
		
		log('init - opts - arg = %j', argumentOptions);
		
		var validationMessage = validator.validateInputConstructor(argumentOptions);
		if(validationMessage){
			log('init - opts - validator = %j', validationMessage);
			throw validationMessage;
		}
		
		optionsToUse = {};
		for(var p in defaultOpts){
			optionsToUse[p] = (argumentOptions[p]) ? argumentOptions[p] : defaultOpts[p];
		}
		
		if( argumentOptions.storage === 'node-cache' && !argumentOptions.strategy ){
			optionsToUse.strategy = 'none';
		}
	}
	
	log('init - opts - optionsToUse = %j', optionsToUse);
	
	var _this = this;
	this.statsHolder = {};
	var StorageClass = null;
	var StrategyClass = null;
	var storage = null;
	
	log('init - storage =', optionsToUse.storage );
	StorageClass = require('./lib/storages/' + optionsToUse.storage);
	storage = new StorageClass(optionsToUse.size, optionsToUse.ttl, optionsToUse.interval);
	
	log('init - strategy =', optionsToUse.strategy, '| type =', typeof(optionsToUse.strategy) );
	if( typeof(optionsToUse.strategy) === 'string' ){
		
		var strategyNameValidate = validator.validateStrategyName(optionsToUse.strategy);
		
		if( strategyNameValidate ){
			log('init - strategy - validation failed = %j', strategyNameValidate );
			throw strategyNameValidate;
		}
		
		var strategyFile = './lib/strategies/' + optionsToUse.strategy;
		StrategyClass = require( strategyFile );
		
	}
	else {
		
		var strategyFuncValidate = validator.validateStrategyFunc(optionsToUse.strategy);
		if( strategyFuncValidate ){
			log('init - strategy - validation failed = %j', strategyFuncValidate );
			throw strategyFuncValidate;
		}
		
		StrategyClass = optionsToUse.strategy;
	}
	var strategyInstance = new StrategyClass(optionsToUse, storage);
	
	var cleanRunner = new Cleaner(
		optionsToUse.ttl, optionsToUse.interval, storage, strategyInstance, this.statsHolder
	);
	
	// ### methods
	this.count = function(){
		return storage.count;
	};
	this.tail = function(){
		return storage.tail();
	};
	this.head = function(){
		return storage.head();
	};
	this.keys = function(){
		return storage.keys();
	};
	this.elements = function(){
		return storage.elements();
	};
	
	this.set = function(key, value){
		
		log('set - key =', key);
		
		var obj = {
			key: key,
			added: new Date(),
			useCount: 0,
			value: value
		};
		return strategyInstance.set(key, obj);
	};
	this.getAsync = function(id, callback){
		
		log('getAsync - key =', id);
		
		var val = strategyInstance.get(id);
		log('getAsync - found = %j', val);
		
		if( val ){
			return callback(null, val);
		}
		else if( !optionsToUse.load ){
			return callback('load function undefined', null);
		}
		else {
			
			//Load from remote
			return optionsToUse.load(id, function(err, result){
				
				log('getAsync - load.callback - key = %s | err = %j | result = %j', id, err, result);
				
				if(err){
					return callback(err, null);
				}
				else {
					var set_ok = _this.set(id, result);
					log('getAsync - load.callback - key =', id, '| set_ok =', set_ok);
					
					return callback(null, result);
				}
			});
			
		}
	};
	this.get = function(id, callback){
		
		if( typeof(callback) !== 'function' ){
			console.error('lean-cache >> error - no callback provided - function get(id, callback){}');
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
			storage: optionsToUse.storage,
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
	
};


