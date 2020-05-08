
// external dependencies
var expect = require('chai').expect;
var path = require('path');
var proxyquire = require('proxyquire');

var utils = require('./utils/utils');

// config
var moduleName = path.basename(__filename);

// funcs
var print = function(msg){
	return console.log(moduleName + ' [TESTRUN] >> ' + msg);
};

// data
var loadFunction = utils.loadFunc;

// target
var dirLevelUp = '../';
var unit = require(dirLevelUp + 'index.js');

// flow
describe(moduleName + '>> node-cache', function(){
	
	var cacheObj = null;
	
	it('init', function(done){
		
		cacheObj = new unit({
			size: 5,
			ttl: 3, // 5 sec
			interval: 1, // 1 sec
			load: loadFunction,
			storage: 'node-cache' // alternative storage
		});
		
		expect( cacheObj.count() ).to.equal(0);
		return done();
		
	});
	
	it('one', function(done){
		
		cacheObj.get("1", function(err, result){
			
			print('one - 1 callback...');
			print('one - 1 cacheObj.count = ' + cacheObj.count());
			
			expect(cacheObj.count()).to.equal(1);
			expect(result.name).to.equal("dummy1");
			
			return done();
		});
		
	});
	
	it('overflow', function(done){
		
		for(var x=2; x<=20; x++){
			cacheObj.get(x.toString(), function(){});
		}
		
		setTimeout(function(){
			print('access overflow - keys = ' + JSON.stringify(cacheObj.keys()) );
			expect(cacheObj.count()).to.equal(5);
			
			var lastObj = cacheObj.tail();
			print('access overflow - last = ' + JSON.stringify(lastObj) );
			expect(lastObj.name).to.equal("dummy5");
			
			var firstObj = cacheObj.head();
			print('access overflow - first = ' + JSON.stringify(firstObj) );
			expect(firstObj.name).to.equal("dummy1");
			
			return done();
		
		}, 50);
		
	});
	
	it('expiery', function(done){
		
		this.timeout(5000);
		
		setTimeout(function(){
			
			print('expiery - stats - count = ' + cacheObj.count() );
			
			expect(cacheObj.count()).to.equal(0);
			
			print('expiery - stats - end = ' + JSON.stringify(cacheObj.stats()) );
			return done();
			
		}, 4100);
		
	});
});


