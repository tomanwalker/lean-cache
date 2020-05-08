

// ## export
var ns = {};
module.exports = ns;

// ## config
ns.storage_enum = {
	MEMORY: 'memory',
	NODECACHE: 'node-cache'
};
ns.storage_types = ['memory', ns.storage_enum.NODECACHE];

// ## funcs
ns.checkConflict = function(opts){
	
	// for <node-cache> only <none> strategy possible
	if( opts.storage && opts.strategy ){
		if( opts.storage === ns.storage_enum.NODECACHE ){
			if( opts.strategy !== 'none' ){
				
				return {
					message:'<strategy> should be a "none" for this <storage>',
					attribute: 'strategy',
					input: opts.strategy
				};
				
			}
		}
	}
	
	return null;
};

ns.validateInputConstructor = function(opts){
	
	// 5m
	if( typeof(opts.size) !== 'undefined' && (opts.size < 0 || opts.size > 5000000) ){
		return {
			message:'<size> should be a Number between 0 & 5000000',
			attribute:'size',
			input: opts.size
		};
	}
	// 30 days
	if( typeof(opts.ttl) !== 'undefined' && (opts.ttl < 0 || opts.ttl > 2592000) ){
		return {
			message:'<ttl> should be a Number of seconds between 0 & 2592000 (30 days)',
			attribute: 'ttl',
			input: opts.ttl
		};
	}
	// interval - 24 hours
	if( typeof(opts.interval) !== 'undefined' && (opts.interval < 0 || opts.interval > 86400) ){
		return {
			message:'<interval> should be a Number of seconds between 0 & 86400 (24 hours)',
			attribute: 'interval',
			input: opts.interval
		};
	}
	// strategy - ...
	if( typeof(opts.strategy) !== 'undefined' ){
		// strategy - string || function
		if(typeof(opts.strategy) !== "string" && typeof(opts.strategy) !== "function"){
			return {
				message:'<strategy> should be a String or Class (function)',
				attribute: 'strategy',
				input: opts.strategy
			};
		}
	}
	// load - function
	if( typeof(opts.load) !== 'undefined' && typeof(opts.load) !== 'function' ){
		return {
			message:'<load> should be a function',
			attribute: 'load',
			input: typeof(opts.load)
		};
	}
	// storage - memory, nodecache
	if( typeof(opts.storage) !== 'undefined' ){
		
		if( ns.storage_types.indexOf( opts.storage ) === -1 ){
			
			return {
				message:'<storage> should be a String - ' + JSON.stringify(ns.storage_types),
				attribute: 'storage',
				input: opts.storage
			};
		}
	}
	
	var conflict = ns.checkConflict(opts);
	if( conflict ){
		return conflict;
	}
	
	return null;
};

ns.validateStrategyName = function(name){
	
	var strategyFile = './strategies/' + name;
	
	try{
		
		require( strategyFile );
		return null;
		
	} catch(e){
		
		return {
			message:'<strategy> not valid strategy name',
			attribute: 'strategy',
			input: name,
			valid: ['fifo', 'lru', 'none']
		};
	}
	
};

ns.validateStrategyFunc = function(argClass){
	
	var textRepresentation = argClass.toString();
	
	if( textRepresentation.indexOf( 'this.get' ) === -1 ){
		return {
			message:'<strategy> method <this.get> missing',
			attribute: 'strategy'
		};
	}
	if( textRepresentation.indexOf( 'this.set' ) === -1 ){
		return {
			message:'<strategy> method <this.set> missing',
			attribute: 'strategy'
		};
	}
	
	return null;
	
};


