
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

// target
var dirLevelUp = '../';
var unit = require(dirLevelUp + 'index.js');

// flow
describe(moduleName + '>> fifo - load for a minute', function(){
	it('quick start', function(done){
		
		this.timeout(61000);
		
		print('init - start...');
		var LeanCache = unit;
		var cacheObj = new LeanCache();
		
		var keepgoing = true;
		var runtime = 60 * 1000;
		var interval = 100;
		var x = 1;
		
		setTimeout(function(){
			
			print('timeout - end...');
			keepgoing = false;
			return done();
			
		}, runtime);
		
		setInterval(function(){
			
			var stats = cacheObj.stats();
			print('stats = ' + JSON.stringify(stats) );
			
		}, 10000);
		
		setInterval(function(){
			
			var val = x * 10;
			cacheObj.set( x, val);
			
			cacheObj.get(x, function(err, result){
				expect(result, 
					`Assert error - x = ${x} | val = ${val} | result = ${result}`
				).to.equal( val );
				
			});
			
			x++;
			
		}, interval);
		
	});
});


