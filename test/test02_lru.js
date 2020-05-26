
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
describe(moduleName + '>> lru', function(){
	
	var cacheObj;
	
	it('init', function(done){
		
		print('init - start...');
		
		cacheObj = new unit({
			size: 5, // 5 records max
			ttl: 3, // 3 second
			interval: 1, // 1 second
			strategy: 'lru', // Least recently used is replaced
			load: loadFunction // Where to get missing data
		});
		
		print('init - cacheObj.count = ' + cacheObj.count());
		expect(cacheObj.count(), `init >> Expected cacheObj.count to equal 0`).to.equal(0);
		
		done();
	});
	it('access few', async function(){
		
		print('access few - start...');
		
		var result = await cacheObj.getPromise("1");
		print('access few - 1 cacheObj.count = ' + cacheObj.count());
		expect(cacheObj.count()).to.equal(1);
		expect(result.name).to.equal("dummy1");
		
		var resultB = await cacheObj.getPromise("2");
		print('access few - 2 cacheObj.count = ' + cacheObj.count());
		expect(cacheObj.count()).to.equal(2);
		expect(resultB.name).to.equal("dummy2");
		
		await cacheObj.getPromise("2");
		return Promise.resolve(true);
		
	});
	
	it('access overflow', function(done){
		
		print('access overflow - start...');
		
		for(var x=1; x<=5; x++){
			cacheObj.get(x.toString(), function(){});
		}
		for(var x=1; x<=5; x++){
			cacheObj.get(x.toString(), function(){});
		}
		for(var z=1; z<=10; z++){
			cacheObj.get(z.toString(), function(){});
		}
		
		//Counting all get counts
		// 2 = accessed 4 times
		// 1 = accessed 3 times
		// 3-5 = accessed 2 times
		// 6-10 = accessed 1 time
		
		print('access overflow - el = ' + JSON.stringify(cacheObj.elements()) );
		expect(cacheObj.count()).to.equal(5);
		print('access overflow - keys = ' + JSON.stringify(cacheObj.keys()) );
		
		var lastObj = cacheObj.tail();
		print('access overflow - last = ' + JSON.stringify(lastObj) );
		expect(lastObj.name).to.equal("dummy10");
		var firstObj = cacheObj.head();
		expect(firstObj.name).to.equal("dummy2");
		
		done();
	});
	it('wait for expiery', function(done){
		this.timeout(5000);
		
		print('lru - stats - start = ' + JSON.stringify(cacheObj.stats()) );
		print('lru - stats - start_el = ' + JSON.stringify(cacheObj.elements()) );
		
		setTimeout(function(){
			
			print('lru - stats - end = ' + JSON.stringify(cacheObj.stats()) );
			print('lru - stats - end_el = ' + JSON.stringify(cacheObj.elements()) );
			expect(cacheObj.count()).to.equal(0);
			
			done();
		}, 4050);
	});
	
});

