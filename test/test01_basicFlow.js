
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
var loadFunction = function(id){
	try{
		return storage[id];
	}
	catch(e){
		return null;
	}
};

// target
var dirLevelUp = '../';
var unit = require(dirLevelUp + 'index.js');

// flow

// TODO Init with different options

describe(moduleName + '>> fifo', function(){
	
	var cacheObj;
	
	it('init', function(done){
		
		cacheObj = new unit({
			size: 5, // 5 records max
			ttl: 2, // 2 second
			iterval: 1, // 1 second
			strategy: 'fifo', // First in first out
			load: loadFunction // Where to get missing data
		});
		
		expect(cacheObj.count).to.equal(0);
		
		done();
	});
	it('access few', function(done){
		
		cacheObj.get("1", function(err, result){
			
			expect(cacheObj.count).to.equal(1);
			expect(result.name).to.equal("dummy1");
			
			cacheObj.get("2", function(err, resultB){
				
				expect(cacheObj.count).to.equal(2);
				expect(resultB.name).to.equal("dummy2");
				done();
			});
		});
	});
	it('access over', function(done){
		
		for(var x=1; x<=20; x++){
			cacheObj.get(x.toString());
		}
		
		expect(cacheObj.count).to.equal(5);
		
		var lastObj = cacheObj.tail;
		expect(lastObj.name).to.equal("dummy20");
		var firstObj = cacheObj.head;
		expect(firstObj.name).to.equal("dummy15");
		
		done();
	});
	it('wait for expiery', function(done){
		
		setTimeout(function(){
			
			expect(cacheObj.count).to.equal(0);
			
			print('fifo - stats = ' + JSON.stringify(cacheObj.getStats()) );
			done();
		}, 2050);
	});
});

describe(moduleName + '>> lru', function(){
	
	it('init', function(done){
		done();
	});
	it('access', function(done){
		done();
	});
	it('stats', function(done){
		done();
	});
});


