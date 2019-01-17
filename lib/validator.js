

// ## export
var ns = {};
module.exports = ns;

// ## funcs
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
			message:'<interval> should be a Number of seconds between 0 & 2592000 (30 days)',
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
	
	return null;
};


