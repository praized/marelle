/*
	  Copyright 2011 PraizedMedia Inc.
	  License: Pending Review...
	  Author: Francois Lafortune
*/

 (function() {
	/* 
		Fake sessionStorage() by storing token in cookie if no sessionStorage
		(used by session obj)
	*/
	if (typeof sessionStorage !== 'object') {
		var sessionStorage = {
			setItem: function(name, value) {
				document.cookie = name + "=" + value + "; path=/";
				return value;
			},
			getItem: function(name) {
				var nameEQ = name + "=";
				var ca = document.cookie.split(';');
				for (var i = 0; i < ca.length; i++) {
					var c = ca[i];
					while (c.charAt(0) == ' ') c = c.substring(1, c.length);
					if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
				}
				return null;
			},
			removeItem: function(name) {
				sessionStorage.setItem(name, '')
			}
		}
	};
	/* 
		Utilities 
		=========
	*/
	// add "s" to string doesnt already end in "s"
	function sing(str) {
		return str.replace(/s$/, '')
	};
	// capitalize first char
	function caps(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	};
	// capitalize an remove last "s" for syntax fancy
	function oname(str) {
		return caps(sing(str))
	};
	// decorate fousquare responses
	function decorate(type, obj, parent) {
		var typeKlass = oname(type);
		if (typeof obj !== 'string' && typeof Hopscotch[typeKlass] !== 'undefined') {
			if (obj.count && obj.count > 0) {
				if (obj.items) {
					var objects = [];
					$.each(obj.items,
					function(i) {
						objects.push(new Hopscotch[typeKlass](obj.items[i]))
					});
				};
				if (parent) parent[type + 'Count'] = obj.count;
				return objects;

			} else return new Hopscotch[typeKlass](obj);
		};
		return obj
	};
	/*
		Core
		====
	*/
	var Session = {
		getToken: function() {
			var token = sessionStorage.getItem('hopscotch_foursquare_token');
			if (token === 'null') return null;
			return token
		},
		setToken: function(value) {
			return sessionStorage.setItem('hopscotch_foursquare_token', value);
		},
		clearToken: function() {
			return sessionStorage.removeItem('hopscotch_foursquare_token');
		},
		initialize: function() {
			var tokRE = /\#?access_token\=(.+)/;
			var token = window.location.hash.match(tokRE);
			token = token ? [token[1], (window.location.hash = '')][0] : Session.getToken();
			Session.setToken(token);
		}
	};
	var Fetcher = {
		cache: {},
		fetch: function() {
			var fargs = Fetcher.swapargs(arguments);
			var url = 'https://api.foursquare.com/v2/' + fargs.path;
			var ctx = this;
			if (Fetcher.cache[url]) return fargs.callback.call(ctx, fetch.cache[url]);
			$.getJSON(url + '?callback=?', fargs.params,
			function(json) {
				if (json.meta.code !== 200) throw json.meta.code + ' ' + json.meta.errorDetail;
				$.each(json.response,
				function(k, obj) {
					if (k !== 'groups') {
						json.response[k] = decorate(k, obj)
					} else {
						$.each(json.response.groups,
						function(i) {
							$.each(json.response.groups[i].items,
							function(k, item) {
								json.response.groups[i].items[k] = decorate('venues', item)
							});
						})
					}
				});
				Fetcher.cache[url] = json.response;
				fargs.callback.call(ctx, json.response);
			});
		},
		swapargs: function(args) {
			var args = Array.prototype.slice.call(args);
			var swap = {
				callback: $.noop,
				params: {
					oauth_token: Session.getToken()
				}
			};
			if (typeof args[args.length - 1] === 'function') swap.callback = args.pop();
			if (typeof args[args.length - 1] === 'object') $.extend(swap.params, args.pop());
			swap.path = args.join('/');
			return swap;
		}
	};
	
	var Hopscotch = {
		getCurrentUser: function(after) {
			var token = Session.getToken();
			if (!token) return after(null);
			else {
				if (Hopscotch.currentUser) return after(Hopscotch.currentUser);
				Fetcher.fetch.call(Hopscotch, 'users', 'self',
				function(json) {
					Hopscotch.currentUser = json;
					after(json);
				});
			};
			return $.hopscotch;
		},
		startSession: function() {
			window.location.href = "https://foursquare.com/oauth2/authenticate?client_id=" + Hopscotch.clientId + "&response_type=token&redirect_uri=http://127.0.0.1/hs"
		},
		endSession: function() {
			Session.clearToken();
			window.location.hash = '';
			window.location.reload(true)
		}
	};
	
	/*
		Meta
		====
	*/
	    var docs = '';
	    function rc(i,chr) {
            var c = 0;
            var s = '';
            while(i>c){
                --i;
                s+=chr
            }
            return s;
	    }
	$.each(FourSquare.endpoints,
	function(endpoint) {
		var klass = oname(endpoint);
		docs += "\n\n"
		var cname = 'Hopscotch.'+klass;
		docs += cname+"\n"+rc(cname.length,'=')+"\n"
		Hopscotch[klass] = (new Function('decorate', 'return function Hopscotch' + klass + '( data ) { for(var k in data){this[k] = decorate(k, data[k], this)}}'))(decorate)
		for (var method in FourSquare.endpoints[endpoint].methods) {
            docs += ("\n\n"+klass+'.'+method+'( '+(FourSquare.endpoints[endpoint].methods[method].length > 0 ? 'params, ': '')+'callback )')		    
            docs +=("\n\nparams: { "+FourSquare.endpoints[endpoint].methods[method].join(': "", ') +': "" }')
			var getterName = method;
			Hopscotch[klass][method] = FourSquare.endpoints[endpoint].methods[method].length === 0 ?
			function(callback) {
				Fetcher.fetch.call(this, endpoint, method, params, callback);
			}:
			function(params, callback) {
				Fetcher.fetch.call(this, endpoint, method, params, callback);
			};
		}
		for (var aspect in FourSquare.endpoints[endpoint].aspects) {
            docs +=("\n\n"+aspect+'( '+(FourSquare.endpoints[endpoint].aspects[aspect].length > 0 ? 'params, ': '')+'callback )')
            docs+= ("\n\nparams: { "+FourSquare.endpoints[endpoint].aspects[aspect].join(': "", ') +': "" }')
			var getterName = 'get' + caps(aspect);
			Hopscotch[klass].prototype[getterName] = FourSquare.endpoints[endpoint].aspects[aspect].length === 0 ?
			function(callback) {
				Fetcher.fetch.call(this, endpoint, this.id, aspect, callback);
			}:
			function(params, callback) {
				Fetcher.fetch.call(this, endpoint, this.id, aspect, params, callback);
			};
		}
		Hopscotch[klass].prototype['get'] = function(callback) {
			Fetcher.fetch.call(this, endpoint, this.id, callback);
		}

	});
console.debug(docs)
	/*
		Initialize
		==========
	*/
	Session.initialize();

	// Expose
	$.extend({
		hopscotch: function(key, readyCallback) {
			if (typeof key !== 'string') throw "Must provide client Id";
			if (!Hopscotch.clientId) {
				$.extend(Hopscotch, {
					isReady: true,
					clientId: key
				});
				$.extend({
					hopscotch: $({}).extend(Hopscotch)
				});
			};
			setTimeout(function() {
				! ($.isFunction(readyCallback)) || $.hopscotch.bind('ready', readyCallback);
				$.hopscotch.trigger('ready', [$.hopscotch]);
			});
		}
	});
})();
