
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

describe('printing', function(){
	it('quick check', function(done){
		
		var quickPrintBody = function(parent){
			return function(err, body){
				print('quick - ' + parent + ' - body = ' + JSON.stringify(body));
				expect(body.name).to.equal('dummy1');
				
			};
		};
		
		var fifo = new unit({
			load: loadFunction,
			strategy: 'fifo'
		});
		
		fifo.get('1', quickPrintBody('fifo') );
		
		var lru = new unit({
			load: loadFunction,
			strategy: 'lru'
		});
		lru.get('1', quickPrintBody('lru') );
		
		var none = new unit({
			load: loadFunction,
			strategy: 'none'
		});
		none.get('1', quickPrintBody('none') );
		
		setTimeout(function(){
			done();
			
		}, 500);
	});
});


