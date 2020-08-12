
// ## dependencies
var expect = require('chai').expect;
var path = require('path');
var proxyquire = require('proxyquire');

// config
var moduleName = path.basename(__filename);

// funcs
var print = function(...msg){
	msg[0] = moduleName + ' [TESTRUN] >> ' + msg[0];
	return console.log(...msg);
};

// target
var dirLevelUp = '../';
var unit = require(dirLevelUp + 'index.js');

// flow
describe('load', function(){
	
	var cache = null;
	
	it('optional', function(done){
		
		cache = new unit({
			size: 5,
			ttl: 2,
			interval: 1
		});
		
		var result = cache.set('1', 'abc');
		print('set 1 - result = %s', result);
		expect(result).to.equal(true);
		
		cache.get('1', function(err, body){
			print('get 1 - err = %s | body = %j', err, body);
			expect(err).to.equal(null);
			expect(body).to.equal('abc');
			
			cache.get('2', function(err2, body2){
				print('get 2 - err = %s | body = %s', err2, body2);
				expect(body2).to.equal(null);
				
				done();
				
			});
			
		});
		
		
	});
	
});


