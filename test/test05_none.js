
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

// data
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
describe(moduleName + '>> none', function(){
	
	var cacheObj;
	
	it('init', function(done){
		
		print('init - start...');
		cacheObj = new unit({
			size: 2, // 2 records max
			ttl: 5, // 5 second
			iterval: 1, // 1 second
			strategy: 'none', // First in first out
			load: loadFunction // Where to get missing data
		});
		
		print('init - cacheObj.count = ' + cacheObj.count());
		expect(cacheObj.count(), `int >> Expected cacheObj.count to equal 0`).to.equal(0);
		
		done();
		
	});
	
	it('get few', function(done){
		
		print('access few - start...');
		
		cacheObj.get("1", function(err, result){
			
			print('access few - 1 callback...');
			print('access few - 1 cacheObj.count = ' + cacheObj.count());
			
			expect(cacheObj.count()).to.equal(1);
			expect(result.name).to.equal("dummy1");
			
			cacheObj.get("2", function(err, resultB){
				
				print('access few - 2 callback...');
				print('access few - 2 cacheObj.count = ' + cacheObj.count());
				
				expect(cacheObj.count()).to.equal(2);
				expect(resultB.name).to.equal("dummy2");
				
				done();
			});
		});
		
	});
	
	it('get overflow', function(done){
		
		print('get overflow - 3 start...');
		
		cacheObj.get("10", function(err, result){
			
			print('get overflow - 3 callback...');
			print('get overflow - 3 cacheObj.count = ' + cacheObj.count());
			print('get overflow - 3 cacheObj.keys = ' + cacheObj.keys());
			print('get overflow - 3 result = ' + result);
			
			var keys = cacheObj.keys();
			
			expect(cacheObj.count()).to.equal(2);
			expect( keys[0] ).to.equal("1");
			expect( keys[1] ).to.equal("2");
			
			expect(result.name).to.equal("dummy10");
			
			/// Here, cache does return overflow key "3" from storage, but doesnt replace previous
			/// elements, giving TTL to handle the expiery and replacement
			
			done();
		});
		
	});
	
	it('set overflow', function(done){
		
		var result = cacheObj.set("new", {name:"test"});
		
		print('set overflow - res = ' + result);
		expect(result).to.equal( false );
		
		var keys = cacheObj.keys();
		
		expect(cacheObj.count()).to.equal(2);
		expect( keys[0] ).to.equal("1");
		expect( keys[1] ).to.equal("2");
		
		done();
		
	});
	
});


