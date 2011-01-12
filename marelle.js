/*
    Name: $.Marelle() 
    Version: 0.1 <-- watch out!
    Description: Foursquare API client library.
    Author: Francois Lafortune, @quickredfox

    Copyright 2011 PraizedMedia Inc. 

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

*/
 (function() {
    // Helpers
    function grepFirst(str, re) {
        var m = str.match(re);
        if (m && m[1]) return m[1];
    };
    // sort of like forEach but for objects, only one level deep
    function eachKey(obj, fn) {
        for (var k in obj) {
            fn(k)
        }
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
    },
    // JSONP handler
    JSONPCache = {},
    JSONP = {
        getOpts: function(args) {
            var args = Array.prototype.slice.call(args),
            callback = (typeof args[(args.length - 1)] !== 'function' ? function noop() {} : args.pop()),
            params = (typeof args[(args.length - 1)] !== 'object' ? {}: args.pop());
            return {
                path: args.join('/'),
                params: $.extend({},
                {
                    oauth_token: Marelle.AUTH_TOKEN
                },
                params),
                callback: callback
            }
        },
        cache: function(opts, data) {
            var cacheKey = JSON.stringify({
                path: opts.path,
                params: opts.params
            });
            return (typeof data === 'undefined' ? JSONPCache[cacheKey] : (JSONPCache[cacheKey] = data));
        },
        get: function() {
            var opts = JSONP.getOpts(arguments);
            var url = 'https://api.foursquare.com/v2/' + opts.path;
            var cached = JSONP.cache(opts);
            if (cached) return opts.callback(cached);
            $.getJSON(url + '?callback=?', opts.params,
            function(json) {
                if (!json.meta) throw "JSONP response inconsistencies";
                if (json.meta.code !== 200) return opts.callback(null, json.meta.code + ' ' + json.meta.errorDetail);
                for (var k in json.response) json.response[k] = Core.decorate(k, json.response[k]);
                JSONP.cache(opts, json.response);
                opts.callback(json.response);
            }
            );
        },
        post: function() {
            var opts = JSONP.getOpts(arguments);
            throw ('unsupported!');
        }
    },
    // Core
    Core = {
        modelize: function(parent, recipes) {
            eachKey(recipes,
            function(name) {
                var recipe = recipes[name]
                var className = name.classify();
                var Class = new Function('decorate', 'return function Marelle' + className + '(data) { for(var k in data) this[k]=decorate(k,data[k],this); }')(Core.decorate);
                eachKey(recipe.methods,
                function(method) {
                    Class[method] = function(params, callback) {
                        if (typeof params === 'function') {
                            callback = params,
                            params = {}
                        }
                        return JSONP.get.call(Class, name, method, params, callback);
                    };
                })
                eachKey(recipe.aspects,
                function(aspect) {
                    Class.prototype['get' + aspect.classify().pluralize()] = function(params, callback) {
                        if (typeof params === 'function') {
                            callback = params,
                            params = {}
                        }
                        return JSONP.get.call(this, name, this.id, aspect, params, callback);
                    }
                });
                eachKey(recipe.actions,
                function(action) {
                    Class.prototype[action] = function(id, params, callback) {
                        if (typeof params === 'function') {
                            callback = params,
                            params = {}
                        }
                        return JSONP.post.call(this, name, id, action, params, callback);
                    }
                });
                parent[className] = Class;
            });
            return parent;
        },
        decorate: function(type, json, parent) {
            var klass = String(type.classify());
            if (parent && typeof json.count !== 'undefined') parent[type + 'Count'] = json.count;
            if (Marelle[klass] && typeof json === 'object') {
                if (json.count) {
                    if (json.items) {
                        var nuitems = [];
                        json.items.forEach(function(item) {
                            nuitems.push(new Marelle[klass](item))
                        });
                        json.items = nuitems;
                    }
                    return json;
                } else {
                    var m = new Marelle[klass](json);
                    return m
                }
            } else if (type === 'groups') {
                json.forEach(function(group, idx) {
                    json[idx].items.forEach(function(item, i) {
                        json[idx].items[i] = Core.decorate('venues', item)
                    })
                });
            };
            return json;
        },
        // synchronize fragment indentifier auth tokens /w locally stored token
        synchronize: function() {
            var winhash = window.location.hash;
            var hashre = {
                token: /^\#?access_token\=([^\&]+)/,
                error: /^\#?error\=([^\&]+)/,
            }
            if (hashre.error.test(winhash)) {
                window.location.hash = '';
                throw 'Foursquare Authentication Error: ' + grepFirst(winhash, hashre.error);
            } else {
                if (hashre.token.test(winhash)) {
                    window.location.hash = '';
                    Core.setToken(grepFirst(winhash, hashre.token));
                };
                if (!Marelle.AUTH_TOKEN) Marelle.AUTH_TOKEN = Core.getToken();
            };

        },
        setToken: function(token) {
            if (window.sessionStorage) sessionStorage['marelleAuthToken'] = token === null ? '': token;
            else document.cookie = token === null ? '': 'marelleAuthToken=' + token + '; path=/';
        },
        getToken: function() {
            var token;
            if (window.sessionStorage) token = sessionStorage['marelleAuthToken'];
            else {
                var tokenRE = /marelleAuthToken\=([^\;\s]+)/;
                token = grepFirst(document.cookie, tokenRE);
            }
            if ( !! (token)) return token;
        },
        clearToken: function() {
            if (window.sessionStorage) sessionStorage.removeItem('marelleAuthToken');
            else {
                document.cookie = '';
            }
        },
        redirect: function(url) {
            if (typeof url === 'undefined') {
                if (window.location.hash) window.location.href = window.location.href.replace(/^\#.+/, '');
                else window.location.reload(true);
            } else {
                window.location.href = url.replace(/\#$/, '')
            }
        },
        makeValidator: function(validators) {
            var vfn = [];
            validators.forEach(function(validator) {
                if ((/\!$/).test(validator)) {
                    vfn.push(function(params) {
                        if (! (params[validator.replace(/\!$/, '')])) throw ('Missing HTTP Parameter: ' + val);
                    });
                };
            });
            return function isValid(params) {
                var self = arguments.callee;
                self.errors = [];
                vfn.forEach(function(fn) {
                    try {
                        fn(params)
                    } catch(E) {
                        self.errors.push(E)
                    };
                });
                return (self.errors.length === 0);
            };
        }

    },
    // Public Interface
    Marelle = {
        startSession: function() {
            Core.redirect("https://foursquare.com/oauth2/authenticate?client_id=" +Marelle.CLIENT_ID + "&response_type=token&redirect_uri=" + window.location.href.replace(/\#.+/, ''));
        },
        endSession: function() {
            Core.clearToken();
            Core.redirect(window.location.href);
        },
        signinButton: function(el) {
            var holder = $(el || document.body);
            return $('<a class="marelle-sign-in-button" href="#">click to connect to foursquare</a>').bind('click', Marelle.startSession).appendTo(holder)
        },
        signoutButton: function(el) {
            var holder = $(el || document.body);
            return $('<a class="marelle-sign-out-button" href="#">click to disconnect from foursquare</a>').bind('click', Marelle.endSession).appendTo(holder)
        },
        bind: function(n, fn) {
            $(Marelle).bind(n, fn);
            return Marelle;
        },
        unbind: function(n, fn) {
            $(Marelle).unbind(n, fn);
            return Marelle;
        },
        trigger: function(n, data) {
            $(Marelle).trigger(n, data);
            return Marelle;
        },
        once: function(n, fn) {
            $(Marelle).one(n, fn);
            return Marelle;
        },
        getAuthenticatedUser: function() {
            return Marelle.User.current;
        }
    };
    // Create "Model" objects
    Core.modelize(Marelle, API);
    // Public API and initialization
    $.extend({
        marelle: function(clid, ready) {
           Marelle.CLIENT_ID = clid ||Marelle.CLIENT_ID;
            setTimeout(function() {
                Core.synchronize(Marelle);
                Marelle.trigger('ready', [Marelle]);
                JSONP.get('users', 'self', {},
                function(json, err) {
                    return (json === null ?
                    Marelle.trigger('disconnected') :
                    Marelle.trigger('connected', [(Marelle.User.current = json.user)])
                    );
                });
            });
            if (typeof ready === 'function') Marelle.bind('ready', ready);
            return Marelle;
        }
    });
    $.extend($.marelle, Marelle);
})();