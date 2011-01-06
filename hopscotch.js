/*
	Copyright 2011 PraizedMedia Inc.
	License: Pending Review...
	Author: Francois Lafortune
*/
(function() {
    function sing(str) {
    	return str.replace(/s$/,'')
    };
    // function plur(str) {
    //  return sing(str)+'s'
    // };
    function caps(str){ return str.charAt(0).toUpperCase() + str.slice(1); };
    function oname(str) { return caps(sing(str)) };
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
    function fetch() {
    	var fargs = fetch.swapargs(arguments);
    	var url = 'https://api.foursquare.com/v2/'+fargs.path;
    	$.getJSON( url , fargs.params, function( json ) {
    		if( json.meta.code !== 200 ) throw [ json.meta.errorType, json.meta.errorDetails ].join( "\n" );
    		for(var k in json.response) json.response[ k ] = decorate( k, json.response[ k ] );
    		fargs.callback( json.response );
    	});
    };
    fetch.swapargs = function (args) {
    	var args = Array.prototype.slice.call(args);
    	var swap = {callback: $.noop, params: {oauth_token:session.getToken()}};
    	if(typeof args[args.length-1] === 'function') swap.callback = args.pop();
    	if(typeof args[args.length-1] === 'object')   $.extend(swap.params,args.pop());
    	swap.path = args.join('/');
    	return swap;
    };
    var session = {
        getToken: function() {
            var token = sessionStorage.getItem('hopscotch_foursquare_token');
    		if(token === 'null') return null;
    		return token
        },
        setToken: function(value) {
            return sessionStorage.setItem('hopscotch_foursquare_token', value);
        },
        clearToken: function() {
            return sessionStorage.removeItem('hopscotch_foursquare_token');
        }
    };
    
    var hopscotch = {
    	getCurrentUser: function(after) {
    		var token = session.getToken();
    		if(!token) return after(null);
    		else{
    			if(hopscotch.currentUser) return after(hopscotch.currentUser);
    			fetch('users','self',function(json) {
    				hopscotch.currentUser = json; 
    				after(json);
    			});
    		};
    		return $.hopscotch;
    	},
        startSession: function() {
        	window.location.href = "https://foursquare.com/oauth2/authenticate?client_id="+hopscotch.clientId+"&response_type=token&redirect_uri=http://127.0.0.1/hs"
        },
    	endSession: function() {
    		session.clearToken();
    		window.location.hash = '';
    		window.location.reload(true)
    	}
    };

    function decorate( type, obj ) {
    	var typeKlass = oname(type);
    	if( hopscotch[ typeKlass ] ) return  hopscotch[ typeKlass ]( obj )
    	// else console.debug('no',type,typeof type,obj)
    	return obj
    };

    $.extend({
        hopscotch: function( key, readyCallback ) {
    		if( typeof key === 'function' || typeof key ==='undefined'){
    			throw "Must provide client Id"
    		}
    		if(!hopscotch.clientId){
    			$.extend(hopscotch,{
    				isReady: true,
    				clientId: key
    			});
    			$.extend({
    				hopscotch: $({}).extend(hopscotch)
    			});
    		};	
    		setTimeout(function() {
    			!($.isFunction(readyCallback))||$.hopscotch.bind('ready',readyCallback);				
    			$.hopscotch.trigger('ready',[ $.hopscotch ] );
    		});
        }
    });

    (function(hopscotch) {
    	for(var endpoint in FourSquare.endpoints){
    		var klass = oname( endpoint );
    		hopscotch[klass] = function( data ) {
    			var k = arguments.callee;
    			if(!(this instanceof arguments.callee)) return new k( data )
    			if(k.hopscotchType === 'user' && !data.id){ data.id = 'self'}
    			$.extend(this,data)
    			this.id = data.id||null;
    			for(var k in this.data){
    				this.data[k] = decorate(k, this.data[k]);
    			}
    		};
    		hopscotch[ klass ].hopscotchType = sing( endpoint );
    		for( var method in FourSquare.endpoints[ endpoint ].methods ){
    			// var paramNames = FourSquare.endpoints[ endpoint ].methods[ meth ];
    			var getterName = 'get'+caps(method);
    			hopscotch[ klass ][ getterName ] = FourSquare.endpoints[ endpoint ].methods[method].length === 0  ? 
    				function( callback ) {
    					fetch( endpoint, method, params, callback );
    				} : 
    				function( params, callback ) {
    					fetch( endpoint, method, params, callback );
    				} ;					
    		};
    		for(var aspect in FourSquare.endpoints[ endpoint ].aspects ){
    			var getterName = 'get'+caps(aspect);
    			hopscotch[ klass ][ getterName ] =  FourSquare.endpoints[ endpoint ].aspects[aspect].length === 0  ? 
    				function( id, callback ) {
    					fetch( endpoint, method, id, aspect, callback );
    				} : 
    				function( id, params, callback ) {
    					fetch( endpoint, method, id, aspect, params, callback );
    				} ;
    			hopscotch[ klass ].prototype[ getterName ] = function( params, callback ) {
    				return hopscotch[ klass ][ getterName ]( this.id, params, callback );
    			};
    		};
    	};
    })(hopscotch)

    var tokRE = /\#?access_token\=(.+)/;
    var token = window.location.hash.match(tokRE);
    token = token ? [token[1],(window.location.hash = '')][0] : session.getToken();
    session.setToken(token)

})();
