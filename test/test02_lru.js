
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
describe(moduleName + '>> lru', function(){
	
	var cacheObj;
	
	it('init', function(done){
		
		print('init - start...');
		
		cacheObj = new unit({
			size: 7, // 7 records max
			ttl: 3, // 3 second
			iterval: 1, // 1 second
			strategy: 'lru', // Least recently used is replaced
			load: loadFunction // Where to get missing data
		});
		
		print('init - cacheObj.count = ' + cacheObj.count());
		expect(cacheObj.count(), `init >> Expected cacheObj.count to equal 0`).to.equal(0);
		
		done();
	});
	it('access few', function(done){
		
		print('access few - start...');
		
		cacheObj.get("1", function(err, result){
			
			print('access few - 1 callback...');
			print('access few - 1 cacheObj.count = ' + cacheObj.count());
			expect(cacheObj.count()).to.equal(1);
			
			expect(result.name).to.equal("dummy1");
			
			cacheObj.get("2", function(err, resultA){
				
				// 2 was added to tail
				// After second use, it should be moved to Head
				
				print('access few - 2a callback...');
				print('access few - 2a cacheObj.count = ' + cacheObj.count());
				
				expect(cacheObj.count()).to.equal(2);
				expect(resultA.name).to.equal("dummy2");
				expect(cacheObj.tail().name).to.equal(resultA.name); // Here, Tail
				
				cacheObj.get("2", function(err, resultB){
					
					print('access few - 2b callback...');
					print('access few - 2b cacheObj.count = ' + cacheObj.count());
					
					expect(cacheObj.count()).to.equal(2);
					expect(resultA.name).to.equal("dummy2");
					expect(cacheObj.head().name).to.equal(resultB.name); // Here, Moved to Head
					
					return done();
				});
			});
		});
	});
	it('access overflow', function(done){
		
		print('access overflow - start...');
		
		for(var x=1; x<=20; x++){
			cacheObj.get(x.toString());
		}
		for(var x=1; x<=10; x++){
			cacheObj.get(x.toString());
		}
		
		//Counting all get counts
		// 2 = accessed 4 times
		// 1 = accessed 3 times
		// 3-10 = accessed 2 times
		
		print('access overflow - el = ' + JSON.stringify(cacheObj.elements()) );
		expect(cacheObj.count()).to.equal(7);
		
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

