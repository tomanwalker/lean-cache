
// ## export
var ns = {};
module.exports = ns;

// ## Config
ns.limitAdd = 1000000;
ns.limitRead = ns.limitAdd / 2;
ns.limitDelete = 1000;

// ## Funcs
ns.measureLoop = function(limit, handler){
	
	var start = new Date();
	
	for(var i=0; i < limit; i++){
		handler(i);
	};
	
	var diff = (new Date()) - start;
	var memory = Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100;
	
	return [diff, memory];
};


