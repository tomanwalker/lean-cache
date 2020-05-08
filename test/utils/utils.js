
// ## dependencies


// ## export
var ns = {};
module.exports = ns;

// ## config
var storage = {};
for(var i=0; i<100; i++){
	storage[i.toString()] = { name:("dummy" + i) };
};

// ## func
ns.db = storage;

ns.loadFunc = function(id, cb){
	
	if( storage[id] ){
		return cb(null, storage[id]);
	}
	
	return cb('not found - ' + id, null);
	
};


