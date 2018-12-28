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
			this.head = el.key;
			this.tail = el.key;
		}
		else {
			var temp = _this.table[this.tail];
			this.tail = el.key;
			
			temp.next = el.key;
			el.prev = temp.key;
		}
		
		_this.count++;
		return true;
	};
	this.list.remove = function(){
		
		if( _this.count === 0 ){
			return false;
		}
		
		var removed = _this.table[this.head];
		
		if( _this.count === 1 ){
			this.head = null;
			this.tail = null;
		}
		else{
			this.head = _this.table[this.head].next;
			_this.table[this.head].prev = null;
		}
		
		_this.count--;
		return removed;
	};
	this.list.swap = function(a, b){
		var obj_a = _this.table[a];
		var obj_b = _this.table[b];
		
		// Should be at least 2 elements in the List
		if( typeof(obj_a) === 'undefined' || typeof(obj_b) === 'undefined' ){
			return false;
		}
		
		// Swap between
		var temp = obj_a.prev;
		obj_a.prev = obj_b.prev;
		obj_b.prev = temp;
		
		temp = obj_a.next;
		obj_a.next = obj_b.next;
		obj_b.next = temp;
		
		if( obj_b.prev === b ) {
			// elements are neighbours
			obj_b.prev = a;
			obj_a.next = b;
		}
		
		// Update neighbours
		if( obj_a.prev !== null ){
			_this.table[ obj_a.prev ].next = a;
		}
		if( obj_b.next !== null ){
			_this.table[ obj_b.next ].prev = b;
		}
		
		// Update tail && head
		if( obj_a.prev === null ) _this.list.head = a;
		if( obj_b.prev === null ) _this.list.head = b;
		if( obj_a.next === null ) _this.list.tail = a;
		if( obj_b.next === null ) _this.list.tail = b;
		
		return true;
	};
	this.list.pop = function(){
		if( _this.count === 0 ){
			return false;
		}
		
		var removed = _this.table[this.tail];
		
		if( _this.count === 1 ){
			this.head = null;
			this.tail = null;
		}
		else{
			this.tail = _this.table[this.tail].prev;
			_this.table[this.tail].next = null;
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
	this.pop = function(){
		var removed = this.list.pop();
		delete this.table[removed.key];
		return removed;
	};
	this.removeByKey = function(key){
		
		var obj = this.table[key];
		delete this.table[key]; //remove from hash
		
		if(obj.next !== null){
			//update next reference to remove element from queue
			this.table[obj.next].prev = obj.prev;
		}
		
		//update count
		this.count -= 1;
		
		if( this.count === 0 ){
			//update head & tail for empty
			this.list.head = null;
			this.list.tail = null;
		}
		else{
			//update head & tail
			if(obj.key === this.list.head){
				this.list.head = obj.next;
			}
		}
	};
	
	this.elements = function(){
		var t = [];
		
		for(var p in this.table){
			t.push(this.table[p]);
		}
		
		return {
			count: this.count,
			head: this.list.head,
			tail: this.list.tail,
			el: t
		};
	};
	
};


