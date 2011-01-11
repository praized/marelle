(function() {
    // Helpers 
    function grepFirst( str, re ) {
        var m = str.match(re);
        if(m && m[1]) return m[1];
    };
    // sort of like forEach but for objects, only one level deep
    function eachKey(obj,fn) {
        for(var k in obj){ fn(k) }
    };
    // API Structure
    var API = {
        users: {
            methods: {
                search: ['phone', 'email', 'twitter', 'twitterSource', 'fbid', 'name'],
                requests: []
            },
            aspects: {
                badges: [],
                checkins: ['limit', 'offset', 'afterTimestamp', 'beforeTimestamp'],
                friends: [],
                tips: ['sort', 'll'],
                todos: ['sort', 'll'],
                venuehistory: [],
            },
            actions: {
                request: [],
                unfriend: [],
                approve: [],
                deny: [],
                setpings: ['value']
            },
        },
        venues: {
            methods: {
                add: ['name', 'address', 'crossStreet', 'city', 'state', 'zip', 'phone', 'll', 'primaryCategoryId'],
                categories: [],
                search: ['ll', 'llAcc', 'alt', 'altAcc', 'query', 'limit', 'intent']
            },
            aspects: {
                herenow: [],
                tips: ['sort']
            },
            actions: {
                marktodo: ['text'],
                flag: ['problem'], 
                proposeedit: ['name', 'address', 'crossStreet', 'city', 'state', 'zip', 'phone', 'll', 'primaryCategoryId'],
            },
        },
        checkins: {
            methods: {
                add: ['venueId', 'venue', 'shout', 'broadcast', 'll', 'llAcc', 'alt', 'altAcc'],
                recent: ['ll', 'limit', 'offset', 'afterTimestamp']
            },
            actions: {
                addcomment: ['text'],
                deletecomment: ['commentId']
            },
        },
        tips: {
            methods: {
                add: ['venueId', 'text', 'url'],
                search: ['ll', 'limit', 'offset', 'filter', 'query']
            },
            actions: {
                marktodo: [],
                markdone: [],
                unmark: []
            },
        },
        photos: {
            methods: {
                add: ['checkingId', 'tipId', 'venueId', 'broadcast', 'll', 'llAcc', 'alt', 'altAcc']
            }
        },
        settings: {
            methods: {
                all: []
            },
            actions: {
                set: ['value']
            },
        },
        badges: {},
        mayorships: {}
    };

    // JSONP handler
    var JSONPCache = {};
    var JSONP = {
        getOpts: function(args) {
            var args = Array.prototype.slice.call(args),
               params = {},
               callback = function noop() {};
               if (typeof args[(args.length - 1)] === 'function') callback = args.pop();
               if (typeof args[(args.length - 1)] === 'object') params = args.pop();
               return {
                   path: args.join('/'),
                   params: $.extend({},{ oauth_token: Lib.AUTH_TOKEN },params),
                   callback: callback
               }
        },
        cache: function ( opts, data ) {
            var cacheKey = JSON.stringify({path:opts.path,params:opts.params});
            if(typeof data === 'undefined') return JSONPCache[cacheKey];
            return (JSONPCache[cacheKey] = data);
        },
        get: function() {
            var opts = JSONP.getOpts(arguments);
            var url =  'https://api.foursquare.com/v2/' + opts.path;
            var cached = JSONP.cache( opts );
            if(cached) return opts.callback(cached);
            $.getJSON(url+ '?callback=?', opts.params,
                function(json) {
                    if (!json.meta) throw "JSONP response inconsistencies";
                    if (json.meta.code !== 200){
                         return opts.callback( null, json.meta.code + ' ' + json.meta.errorDetail);
                    }
                    else{
                        for(var k in json.response) json.response[k] = Lib.decorate( k, json.response[k] );
                        JSONP.cache( opts, json.response );
                        opts.callback( json.response );
                    } 
                }
            );
        },
        post: function() {
            var opts = JSONP.getOpts(arguments);
            throw ('unsupported!');
        }
    };
    // Core 
    var Lib = {
        modelize: function (parent, recipes ) {
            eachKey(recipes,
                function(name) {
                    var recipe = recipes[name]
                    var className = name.classify();
                    var Class = new Function('decorate', 'return function Marelle' + className + '(data) { for(var k in data) this[k]=decorate(k,data[k],this); }')(Lib.decorate);
                    eachKey(recipe.methods,
                        function(method) {
                            Class[method] = function(params, callback) {
                                !(typeof params === 'function') || [(callback = params), (params = {})];
                                return JSONP.get.call(Class, name, method, params, callback);
                            };
                        })
                    eachKey(recipe.aspects,
                        function(aspect) {
                            Class.prototype['get' + aspect.classify().pluralize()] = function(params, callback) {
                                !(typeof params === 'function') || [(callback = params), (params = {})];
                                return JSONP.get.call(this, name, this.id, aspect, params, callback);
                            }
                        });
                    eachKey(recipe.actions,
                        function(action) {
                            Class.prototype[action] = function(id, params, callback) {
                                !(typeof params === 'function') || [(callback = params), (params = {})];
                                return JSONP.post.call(this, name, id, action, params, callback);
                            }
                        });
                    parent[className] = Class;
            });
            return parent;
        },
        decorate: function ( type, json, parent ) {
            var klass = String(type.classify());    
            if(parent && typeof json.count !== 'undefined') parent[type+'Count'] = json.count;   
            if( Marelle[klass] ){
                if(json.count){
                    if(json.items){
                        var nuitems = [];
                        json.items.forEach(function(item) {
                            nuitems.push( new Marelle[ klass ]( item ) );                                
                        })
                        json.items = nuitems;
                    }
                    return json;
                }else{
                    var m = new Marelle[klass](json);
                    return m                    
                }
            }else if( type === 'groups' ){
                json.forEach( function( group, idx ) {
                    json[ idx ].items.forEach(function(item, i) {
                        json[ idx ].items[i] = Lib.decorate('venues',item)
                    }) 
                } );
            };
            return json;
        },
        // synchronize fragment indentifier auth tokens /w locally stored token
        synchronize: function () {
            var winhash = window.location.hash;
            var hashre = {
                token: /^\#?access_token\=([^\&]+)/,
                error: /^\#?error\=([^\&]+)/,
            }
            if( hashre.error.test( winhash ) ){
                window.location.hash = '';
                throw 'Foursquare Authentication Error: '+grepFirst( winhash, hashre.error );
            }else{
                if( hashre.token.test( winhash ) ){
                    window.location.hash = '';            
                    Lib.setToken( grepFirst( winhash, hashre.token ) );            
                };
                if( !Lib.AUTH_TOKEN ) Lib.AUTH_TOKEN = Lib.getToken();
            };

        },
        setToken: function( token ) {
            if(window.sessionStorage) sessionStorage['marelleAuthToken'] = token === null ? '' : token;
            else document.cookie = token === null ? '' : 'marelleAuthToken='+token+'; path=/';
        },
        getToken: function() {
            var token;
            if(window.sessionStorage) token = sessionStorage['marelleAuthToken'];
            else{
                var tokenRE = /marelleAuthToken\=([^\;\s]+)/;
                token = grepFirst( document.cookie,  tokenRE );
            }
            if(!!(token)) return token;
        },
        clearToken: function() {
          if(window.sessionStorage) sessionStorage.removeItem('marelleAuthToken');
          else{
              document.cookie = '';
          }
        },
        redirect: function( url ) {
            if(typeof url === 'undefined'){
                if(window.location.hash) window.location.href = window.location.href.replace(/^\#.+/,'');
                else window.location.reload(true) ;
            }else{
                 window.location.href = url.replace(/\#$/,'')
            }
        },
        makeValidator: function(validators) {
            var vfn = [];
            validators.forEach( function( validator ) {
                if( ( /\!$/ ).test( validator ) ){
                    vfn.push(function(params) {
                        if( !(params[ validator.replace(/\!$/,'') ]) ) throw ('Missing HTTP Parameter: '+val);
                    });
                };
            } );
            return function isValid(params) {
                var self = arguments.callee;
                self.errors = [];
                vfn.forEach( function( fn ){
                    try{ fn( params) }catch( E ){ self.errors.push( E ) };
                } );
                return ( self.errors.length === 0 );
            };
        }

    };

    // Public Interface 
    var Marelle = {
        startSession: function() {
    	    Lib.redirect("https://foursquare.com/oauth2/authenticate?client_id=" + Lib.CLIENT_ID + "&response_type=token&redirect_uri="+window.location.href.replace(/\#.+/,''));
        },
        endSession: function() {
            Lib.clearToken();
            Lib.redirect( window.location.href );
        },
        signinButton: function( el ) {
            var holder = $( el||document.body );
            return $('<a class="marelle-sign-in-button" href="#">click to connect to foursquare</a>').bind('click', Marelle.startSession).appendTo(holder)     
        },
        signoutButton: function( el ) { 
            var holder = $( el||document.body );		
            return 	$('<a class="marelle-sign-out-button" href="#">click to disconnect from foursquare</a>').bind('click',Marelle.endSession).appendTo(holder)        
        },
        bind:  function(n,fn) {
            $( Marelle ).bind( n, fn );
            return Marelle;
        },
        unbind: function(n,fn) {
            $( Marelle ).unbind( n, fn );
            return Marelle;            
        },
        trigger: function(n,data) {
            $( Marelle ).trigger( n, data );
            return Marelle;
        },    
        once:function(n,fn) {
            $( Marelle ).one( n, fn );
            return Marelle;
        },
        getAuthenticatedUser: function() {
            return Marelle.User.current;
        }
    };
    // Create "Model" objects
    Lib.modelize( Marelle , API );
    // Public API and initialization
    $.extend({
        marelle: function(clid, ready) {
            Lib.CLIENT_ID = clid || Lib.CLIENT_ID;
            setTimeout(function() {
                Lib.synchronize( Marelle );
                Marelle.trigger('ready', [ Marelle ] );
                JSONP.get('users', 'self', {},
                function(json, err) {
                    if (json !== null) {
                        Marelle.User.current = json.user;
                        Marelle.trigger( 'connected', [ Marelle.User.current ] );
                    }else{
                        Marelle.trigger( 'disconnected' );
                    };
                });
            });
            if (typeof ready === 'function') Marelle.bind( 'ready', ready );
            return Marelle;
        }
    });
    $.extend( $.marelle, Marelle );
})();