/**
 * Jquery Bridge.js
 *
 * A bridge that will let you use jquery style syntax and plugins with micro frameworks
 *
 * @author    Samuel Birch
 * @copyright Copyright (c) 2016 samuelbirch
 * @link      https://madebyjam.com
 * @version   1.0.0
 */

function indexOf(ar, val) {
	for (var i = 0; i < ar.length; i++) if (ar[i] === val) return i
	return -1
}

function uniq(ar) {
	var r = [], i = 0, j = 0, k, item, inIt
	for (; item = ar[i]; ++i) {
		inIt = false
		for (k = 0; k < r.length; ++k) {
			if (r[k] === item) {
				inIt = true; break
			}
		}
		if (!inIt) r[j++] = item
	}
	return r
}

function dimension(type, opt_v) {
	return typeof opt_v == 'undefined'
	? engine.dom(this).dim()[type]
	: this.css(type, opt_v)
}


var engine = {
	dom: null,
	query: null,
	event: null,
	ajax: null,
	fx: null
}

var domReady = [];

/* Global $ */

var $ = function(selector){
	var dom = engine.dom,
		q = engine.query;
	
	if(typeof(selector) == 'function'){
		domReady.push(selector);
	}else if(selector){
		return /^\s*</.test(selector) ? dom(dom.create(selector)) : dom(q(selector));
	}else{
		return dom();
	}
}

$.extend = function(){
	var r = {};
	for(var o in arguments){
		for(var p in arguments[o]){
			r[p] = arguments[o][p];
		}
	}
	return r;
} 
$.each = function(items, callback){
	
	if(typeof(items) == 'object'){
		for(var o in items){
			callback.call(items[o], o, items[o]);
		}
	}else{
		//items.forEach(callback);
		for(var i=0; i<items.length; i++){
			//items[i].callback.call();
			callback.call(items[i], i, items[i]);
		}
	}
}

$.proto = function(obj){
	engine.dom.aug(obj)
}

$.domReady = function(){
	domReady.forEach(function(fn){
		fn.call();
	})
}

$.init = {
	
	dom: function(dom){
		engine.dom = dom;
		
		$.fn = engine.dom.prototype = {};
		
		dom.aug({
			
			parents: function (selector, closest) {
				if (!this.length) return this
				if (!selector) selector = '*'
				var collection = dom(selector), j, k, p, r = []
				for (j = 0, k = this.length; j < k; j++) {
					p = this[j]
					while (p = p.parentNode) {
						if (~indexOf(collection, p)) {
							r.push(p)
							if (closest) break;
						}
					}
				}
				return dom(uniq(r))
			},
			
			siblings: function () {
				var i, l, p, r = []
				for (i = 0, l = this.length; i < l; i++) {
					p = this[i]
					while (p = p.previousSibling) p.nodeType == 1 && r.push(p)
					p = this[i]
					while (p = p.nextSibling) p.nodeType == 1 && r.push(p)
				}
				return dom(r)
			},
			
			children: function () {
				var i, l, el, r = []
				for (i = 0, l = this.length; i < l; i++) {
					if (!(el = dom.firstChild(this[i]))) continue;
					r.push(el)
					while (el = el.nextSibling) el.nodeType == 1 && r.push(el)
				}
				return dom(uniq(r))
			},
			
			height: function (v) {
				return dimension.call(this, 'height', v)
			},
			
			width: function (v) {
				return dimension.call(this, 'width', v)
			},
			
			outerHeight: function(b){
				var el = this.get(0);
				return Math.max(el.scrollHeight, el.offsetHeight, el.clientHeight);
			},
			
			add: function($item){
				var items = [];
				this.each(function(){
					items.push(this);
				})
				$item.each(function(){
					items.push(this);
				})
				return dom(items);
			}
		});
	},
	query: function(q){
		engine.query = q;
		
		var dom = engine.dom;
		
		dom.setQueryEngine(q);
		
		dom.aug({
			find: function (s) {
				var r = [], i, l, j, k, els
				for (i = 0, l = this.length; i < l; i++) {
					els = q(s, this[i])
					for (j = 0, k = els.length; j < k; j++) r.push(els[j])
				}
				return dom(q.uniq(r))
			},
			
			filter: function(s){
				return dom(q(s, this));
			}
		});
	},
	event: function(ev){
		engine.event = ev;
		
		ev.setSelectorEngine(engine.query);
		
		var dom = engine.dom;
		var props = {
			trigger: function(name, params){
				return this.each(function(elem){
					return ev.fire(elem, name, params);
				})
			},
			
			cloneEvents: function(target, event){
				return ev.clone(target, this, event);
			}
		};
		
		['on', 'one', 'off', 'fire'].forEach(function(e){
			props[e] = function(name, callback){
				return this.each(function(elem){
					return ev[e](elem, name, callback);
				})
			}
		});
		
		props.bind = props.on;
		
		dom.aug(props);
	},
	ajax: function(r){
		engine.ajax = r;
		$.ajax = engine.ajax;
		
		var dom = engine.dom;
		
		dom.aug({
			serialize: r.serialize,
			serializeArray: r.serializeArray,
			toQueryString: r.toQueryString,
		});
	},
	fx: function(f){
		engine.fx = f;
		
		var dom = engine.dom;
		
		dom.aug({
			animate: function(opts){
				return f(this, opts);
			},
			
			fadeIn: function(d, fn){
				return f(this, {
					duration: d,
					opacity: 1,
					complete: fn
				})
			},
			
			fadeOut: function(d, fn){
				return f(this, {
					duration: d,
					opacity: 0,
					complete: fn
				})
			},
			
			tween: f.tween
		});
	}
}

module.exports = $