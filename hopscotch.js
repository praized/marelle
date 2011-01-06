/*
	Copyright 2011 PraizedMedia Inc.
	License: Pending Review...
	Author: Francois Lafortune
*/
(function() {
    // add "s" to string doesnt already end in "s"
    function sing(str) {
    	return str.replace(/s$/,'')
    };
    // capitalize first char
    function caps(str){ return str.charAt(0).toUpperCase() + str.slice(1); };
    // capitalize an remove last "s" for syntax fancy
    function oname(str) { return caps(sing(str)) };
    // decorate fousquare responses
    function decorate( type, obj ) {
    	var typeKlass = oname(type);
    	if( Hopscotch[ typeKlass ] ) return  Hopscotch[ typeKlass ]( obj );
        else console.debug('no',type,typeof type,obj)
    	return obj
    };
    /* 
        fake sessionStorage by storing token in cookie if no sessionStorage
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
    function fetch() {
    	var fargs = fetch.swapargs(arguments);
    	var url = 'https://api.foursquare.com/v2/'+fargs.path;
    	var ctx = this;
    	$.getJSON( url , fargs.params, function( json ) {
    		if( json.meta.code !== 200 ) throw [ json.meta.errorType, json.meta.errorDetails ].join( "\n" );
    		for(var k in json.response) json.response[ k ] = decorate( k, json.response[ k ] );
    		fargs.callback.call( ctx, fargs, json.response );
    	});
    };
    fetch.swapargs = function (args) {
    	var args = Array.prototype.slice.call(args);
    	var swap = {callback: $.noop, params: {oauth_token:Session.getToken()}};
    	if(typeof args[args.length-1] === 'function') swap.callback = args.pop();
    	if(typeof args[args.length-1] === 'object')   $.extend(swap.params,args.pop());
    	swap.path = args.join('/');
    	return swap;
    };
    var Session = {
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
    
    var Hopscotch = {
    	getCurrentUser: function(after) {
    		var token = Session.getToken();
    		if(!token) return after(null);
    		else{
    			if(Hopscotch.currentUser) return after(Hopscotch.currentUser);
    			fetch('users','self',function( req, json) {
    				Hopscotch.currentUser = json; 
    				after(json);
    			});
    		};
    		return $.hopscotch;
    	},
        startSession: function() {
        	window.location.href = "https://foursquare.com/oauth2/authenticate?client_id="+Hopscotch.clientId+"&response_type=token&redirect_uri=http://127.0.0.1/hs"
        },
    	endSession: function() {
    		Session.clearToken();
    		window.location.hash = '';
    		window.location.reload(true)
    	}
    };

	for(var endpoint in FourSquare.endpoints){
		var klass = oname( endpoint );
		Hopscotch[klass] = function( data ) {
			var k = arguments.callee;
			if(!(this instanceof arguments.callee)) return new k( data )
			if(k.name === 'user' && !data.id){ data.id = 'self'}
			$.extend(this,data)
			this.id = data.id||null;
			for(var k in this.data){
			    console.debug(k)
				this.data[k] = decorate(k, this.data[k]);
			}
		};
		Hopscotch[klass].name = sing( endpoint );
		for( var method in FourSquare.endpoints[ endpoint ].methods ){
			// var paramNames = FourSquare.endpoints[ endpoint ].methods[ meth ];
			var getterName = 'get'+caps(method);
			Hopscotch[ klass ][ getterName ] = FourSquare.endpoints[ endpoint ].methods[method].length === 0  ? 
				function( callback ) {
					fetch( endpoint, method, params, callback );
				} : 
				function( params, callback ) {
					fetch( endpoint, method, params, callback );
				} ;					
		};
		for(var aspect in FourSquare.endpoints[ endpoint ].aspects ){
			var getterName = 'get'+caps(aspect);
			Hopscotch[ klass ][ getterName ] =  FourSquare.endpoints[ endpoint ].aspects[aspect].length === 0  ? 
				function( id, callback ) {
					fetch.call( this , endpoint, method, id, aspect, callback );
				} : 
				function( id, params, callback ) {
					fetch.call( this, endpoint, method, id, aspect, params, callback );
				} ;
			Hopscotch[ klass ].prototype[ getterName ] = function( params, callback ) {
				return Hopscotch[ klass ][ getterName ]( this.id, params, callback );
			};
		};
	};

    var tokRE = /\#?access_token\=(.+)/;
    var token = window.location.hash.match(tokRE);
    token = token ? [token[1],(window.location.hash = '')][0] : Session.getToken();
    Session.setToken(token)

    $.extend({
        hopscotch: function( key, readyCallback ) {
    		if( typeof key === 'function' || typeof key ==='undefined'){
    			throw "Must provide client Id"
    		}
    		if(!Hopscotch.clientId){
    			$.extend(Hopscotch,{
    				isReady: true,
    				clientId: key
    			});
    			$.extend({
    				hopscotch: $({}).extend(Hopscotch)
    			});
    		};	
    		setTimeout(function() {
    			!($.isFunction(readyCallback))||$.hopscotch.bind('ready',readyCallback);				
    			$.hopscotch.trigger('ready',[ $.hopscotch ] );
    		});
        }
    });
})();
