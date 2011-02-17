/*
  grep()

  Returns the first matched grouping.

  @param {String} str The string to search.
  @param {RegExp} re  The regular expression to match.

  @return First matched group
*/var Marelle, clearToken, decorate, getToken, grep, modelize, redirect, setToken, synchronize;
var __hasProp = Object.prototype.hasOwnProperty;
grep = function(str, re) {
  var m;
  m = str.match(re);
  if (m && m[1]) {
    return m[1];
  }
};
/*
  modelize()

  Takes the structure from api.coffee and materializes
  it into a DSL for use qith jQuery.

  @returns An augmented Marelle object.
*/
modelize = function() {
  var action, aspect, aspectName, endpoint, http, method, model, modelName, name, spec, _ref, _ref2, _ref3;
  for (name in API) {
    endpoint = API[name];
    modelName = name.classify();
    model = function(data) {
      var v, value, _results;
      _results = [];
      for (v in data) {
        if (!__hasProp.call(data, v)) continue;
        value = data[v];
        _results.push(this[v] = decorate(v, value, this));
      }
      return _results;
    };
    _ref = endpoint.methods;
    for (method in _ref) {
      spec = _ref[method];
      http = (spec.http || 'get').toLowerCase();
      model[method] = function(params, callback) {
        if (typeof params === 'function') {
          callback = params;
          params = {};
        }
        return XHR.request.call(model, http, name, method, params, callback);
      };
    }
    _ref2 = endpoint.aspects;
    for (aspect in _ref2) {
      spec = _ref2[aspect];
      http = (spec.http || 'get').toLowerCase();
      aspectName = 'get' + aspect.classify().pluralize();
      model.prototype[aspectName] = function(params, callback) {
        if (typeof params === 'function') {
          callback = params;
          params = {};
        }
        return XHR.request.call(this, http, name, this.id, aspect, params, callback);
      };
    }
    _ref3 = endpoint.actions;
    for (action in _ref3) {
      spec = _ref3[action];
      http = (spec.http || 'get').toLowerCase();
      model.prototype[action] = function(id, params, callback) {
        if (typeof params === 'function') {
          callback = params;
          params = {};
        }
        return XHR.request.call(this, http, name, id, action, params, callback);
      };
    }
    Marelle[modelName] = model;
  }
  return Marelle;
};
/*
  decorate()

  Decorates a json response from the foursquare API, casting
  nodes to their Marelle equivalent models.

  @params {String} type The type of object we want ot decorate.
  @params {Object} json The json data represnting this object.
  @params {Object} parent The parent object, if any.

  @returns The provided json, decorated.
*/
decorate = function(type, json, parent) {
  var model, nuitems;
  model = String.prototype.classify.call(type);
  if (parent && typeof json.count !== 'undefined') {
    parent[type + 'Count'] = json.count;
  }
  if (Marelle[model] && typeof json === 'object') {
    if (json.count) {
      if (json.items) {
        nuitems = [];
        json.items.forEach(function(item) {
          return nuitems.push(new Marelle[model](item));
        });
        json.items = nuitems;
      }
      return json;
    } else {
      return new Marelle[klass](json);
    }
  } else if (type === 'groups') {
    json.forEach(function(group, idx) {
      return json[idx].items.forEach(function(item, i) {
        return json[idx].items[i] = decorate('venues', item);
      });
    });
  }
  return json;
};
/*
  synchronize()

  Looks for an access_token or error argument within the
  location hash in order to setup the Marelle.AUTH_TOKEN
  parameter
*/
synchronize = function() {
  var hashregex, winhash;
  winhash = window.location.hash;
  hashregex = {
    token: /^\#?access_token\=([^\&]+)/,
    error: /^\#?error\=([^\&]+)/
  };
  if (hashregex.error.test(winhash)) {
    window.location.hash = '';
    throw 'Foursquare Authentication Error: ' + grep(winhash, hashregex.error);
  } else {
    if (hashregex.token.test(winhash)) {
      window.location.hash = '';
      setToken(grep(winhash, hashregex.token));
    }
    if (!Marelle.AUTH_TOKEN) {
      Marelle.AUTH_TOKEN = getToken();
    }
  }
  return Marelle;
};
/*
  setToken()

  Sets the visitor's oauth token within localStorage.

  @params {String} token The oauth token string.
*/
setToken = function(token) {
  return localStorage.setItem('marelleAuthToken', token);
};
/*
  getToken()

  Gets the visitor's oauth token within localStorage

*/
getToken = function() {
  return localStorage.getItem('marelleAuthToken');
};
/*
  clearToken()

  Clear the visitor's oauth token from within localStorage

*/
clearToken = function() {
  return localStorage.removeItem('marelleAuthToken');
};
/*
  redirect()

  Redirect the browser to the provided URL (removing empty hash if present)
  @param {String} url The URL to redirect to

*/
redirect = function(url) {
  return window.location.href = url.replace(/\#$/, '');
};
/*

  Marelle
  =======

  Marelle's public interface.

*/
Marelle = {
  startSession: function() {
    var startURL;
    startURL = "https://foursquare.com/oauth2/authenticate?";
    startURL += "client_id=" + Marelle.CLIENT_ID + "&response_type=token&redirect_uri=";
    startURL += window.location.href.replace(/\#.+/, '');
    return redirect(startURL);
  },
  endSession: function() {
    clearToken();
    return redirect(window.location.href);
  },
  signinButton: function(el) {
    var button, holder;
    el || (el = document.body);
    holder = $(el);
    button = $('<a class="marelle-sign-in-button" href="#">click to connect to foursquare</a>');
    button.bind('click', function(e) {
      e.preventDefault();
      return Marelle.startSession();
    });
    return holder.append(button);
  },
  signoutButton: function(el) {
    var button, holder;
    el || (el = document.body);
    holder = $(el);
    button = $('<a class="marelle-sign-out-button" href="#">click to disconnect from foursquare</a>');
    button.bind('click', function(e) {
      e.preventDefault();
      return Marelle.endSession();
    });
    return holder.append(button);
  },
  authenticateVisitor: function() {
    var request;
    request = XHR.request('get', 'users', 'self', {});
    request.done(function(json) {
      return $.Marelle.Visitor = new Marelle.User(json);
    });
    request.fail(function() {
      return delete $.Marelle.Visitor;
    });
    return request;
  }
};
modelize(Marelle, API);
/*
  jQuery bootstrap.
*/
$.extend({
  Marelle: function(clientID) {
    var deferred;
    deferred = $.Deferred();
    Marelle.CLIENT_ID = clientID || Marelle.CLIENT_ID;
    synchronize(Marelle);
    deferred.resolve(Marelle);
    return deferred.promise();
  }
});
$.extend($.Marelle, Marelle);