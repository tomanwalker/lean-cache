"use strict";

// Alex Shkunov - 2018 - Initial implmentation

// ## constants
var DEFAULT_OPTIONS = {
	size: 100000, // 100k records max
	ttl: (60 * 60), // 1 hour
	iterval: 60, // 1 minute
	strategy: 'fifo', // First in first out
	load: null // Where to get missing data
};

// ## export
module.exports = function(argumentOptions){
	
	// initialize
	var optionsToUse;
	
	if( !argumentOptions ){
		// just use the defaults
		optionsToUse = DEFAULT_OPTIONS;
	}
	else{
		var validationMessage = validateInputConstructor(argumentOptions);
		if(validationMessage){
			throw validationMessage;
		}
		
		optionsToUse = {};
		for(var p in DEFAULT_OPTIONS){
			optionsToUse[p] = (argumentOptions[p]) ? argumentOptions[p] : DEFAULT_OPTIONS[p];
		}
	}
	
	var strategyClass = require('./lib/' + optionsToUse.strategy);
	return new strategyClass(optionsToUse);
	
};

// ## static functions
var validateInputConstructor = function(options){
	
	return null;
};


