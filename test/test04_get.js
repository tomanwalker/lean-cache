
// external dependencies
var expect = require('chai').expect;
var path = require('path');
var proxyquire = require('proxyquire');

// config
var moduleName = path.basename(__filename);

// funcs
var print = function(msg){
	return console.log(moduleName + ' [TESTRUN] >> ' + msg);
};

var storage = {};
for(var i=0; i<100; i++){
	storage[i.toString()] = { name:("dummy" + i) };
};
var loadFunction = function(id, cb){
	try{
		return cb(null, storage[id]);
	}
	catch(e){
		return cb(true, null);
	}
};


// target
var dirLevelUp = '../';
var unit = require(dirLevelUp + 'index.js');

// flow
describe('GET', function(){
	it('no callback', function(){
		
		print('get.nocallback - start...');
		var catched = false;
		
		var target = new unit({
			load: loadFunction
		});
		
		var result = target.get('abc');
		
		print('get.nocallback - start - result = ' + result);
		//expect(result).to.equal('error - no callback provided - function get(id, callback){}');
		
	});
});


