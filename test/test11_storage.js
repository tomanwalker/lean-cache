
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
var unit = require(dirLevelUp + 'lib/storages/memory.js');

// flow
describe(moduleName + '>> positive', function(){
	
	var bag = new unit();
	
	it('add', function(){
		bag.add('1', {key:'1', value:{name:"dummy1"}});
		bag.add('2', {key:'2', value:{name:"dummy2"}});
		bag.add('3', {key:'3', value:{name:"dummy3"}});
		
		print('pos.add - elements = ' + JSON.stringify(bag.elements()));
		
		expect(bag.count).to.equal(3);
		expect(bag.list.head).to.equal('1');
		expect(bag.list.tail).to.equal('3');
	});
	
	it('remove', function(){
		
		var rem = bag.remove();
		
		print('pos.remove - elements = ' + JSON.stringify(bag.elements()));
		
		expect(bag.count).to.equal(2);
		expect(bag.list.head).to.equal('2');
		expect(bag.list.tail).to.equal('3');
		expect(rem.key).to.equal('1');
		
	});
	
	it('swap', function(){
		
		bag.add('4', {key:'4', value:{name:"dummy4"}});
		
		bag.list.swap('4', '3');
		print('pos.swap - elements = ' + JSON.stringify(bag.elements()));
		
		expect(bag.count).to.equal(3);
		expect(bag.list.tail).to.equal('3');
		expect(bag.list.head).to.equal('2');
		expect(bag.table[bag.list.head].next).to.equal('4'); // linkage should change 2-3 --> 2-4
		
	});
	
	it('display', function(){
		print('pos.display - elements = ' + JSON.stringify(bag.elements()));
		
		expect(bag.count).to.equal(3);
	});
	
});


