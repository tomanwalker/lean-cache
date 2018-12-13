"use strict";

// ## export
module.exports = function(options){
	
	// initialize
	this.options = options;
	
	// fields
	var _this = this;
	var table = {};
	var list = {
		head: null,
		tail: null,
		count: 0,
		add: function(el){
			
			// Iteration from head to tail
			// head has No prev
			// tail has No next
			el.prev = null;
			el.next = null;
			
			//empty
			if( this.count === 0 ){
				this.head = el;
				this.tail = el;
			}
			else {
				var temp = this.tail;
				this.tail = el;
				
				temp.next = el;
				el.prev = temp;
			}
			
			this.count++;
			return true;
		},
		remove: function(){
			
			if( this.count === 0 ){
				return false;
			}
			
			var removed = this.head;
			
			if( this.count === 1 ){
				this.head = null;
				this.tail = null;
			}
			else{
				
				this.head = this.head.next;
				this.head.prev = null;
			}
			
			this.count--;
			return removed;
		},
		print: function(){
			
			var next = this.head;
			var arr = [];
			
			while(next){
				arr.push(next.key);
				next = next.next;
			}
			
			console.log('[' + arr.join('-') + ']');
		}
	};
	
	// methods
	this.tail = function(){
		return list.tail.value;
	};
	this.head = function(){
		return list.head.value;
	};
	this.keys = function(){
		return Object.keys(table);
	};
	
	this.count = function(){
		return list.count;
	};
	
	this.set = function(key, value){
		
		var obj = {
			key: key,
			added: new Date(),
			value: value
		};
		
		table[key] = obj;
		list.add(obj);
		
		//list.print();
		
		var sizeDiff = this.count() - this.options.size;
		
		// remove
		for(var i=0; i < sizeDiff; i++){
			var removed = list.remove();
			delete table[removed.key];
		}
		
		return true;
	};
	
	this.getAsync = function(id, callback){
		
		if( table[id] ){
			return callback(null, table[id].value);
		}
		
		if( !this.options.load ){
			return callback('load function undefined', null);
		}
		
		//Load from remote
		this.options.load(id, function(err, result){
			
			_this.set(id, result);
			return callback(err, result);
		});
	};
	
	this.get = function(id, callback){
		
		if( typeof(callback) !== 'function' ){
			callback = function(){};
		}
		
		return this.getAsync(id, callback);
	};
	
};


