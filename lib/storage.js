"use strict";

// ## export
module.exports = function(size){
	
	var _this = this;
	
	this.size = Number(size) || 0; // 0 = Infinity
	this.count = 0;
	
	// Hashmap - keyvalue
	this.table = {};
	// Queue - linked list
	this.list = {
		head: null,
		tail: null
	};
	
	//methods
	this.list.add = function(el){
		
		// Iteration from head to tail
		// Items added to the Tail
		// head has No prev
		// tail has No next
		el.prev = null;
		el.next = null;
		
		//empty
		if( _this.count === 0 ){
			this.head = el;
			this.tail = el;
		}
		else {
			var temp = this.tail;
			this.tail = el;
			
			temp.next = el;
			el.prev = temp;
		}
		
		_this.count++;
		return true;
	};
	this.list.remove = function(){
		
		if( _this.count === 0 ){
			return false;
		}
		
		var removed = this.head;
		
		if( _this.count === 1 ){
			this.head = null;
			this.tail = null;
		}
		else{
			this.head = this.head.next;
			this.head.prev = null;
		}
		
		_this.count--;
		return removed;
	};
	
	this.remove = function(){
		var removed = this.list.remove();
		delete this.table[removed.key];
		return removed;
	};
	this.add = function(key, obj){
		this.table[key] = obj;
		this.list.add(obj);
	};
	
};
