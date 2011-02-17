# HELPERS 

###
  grep()
  
  Returns the first matched grouping.
  
  @param {String} str The string to search.
  @param {RegExp} re  The regular expression to match.
  
  @return First matched group
###

grep= (str, re)->
    m = str.match re
    if m and m[1] then return m[1] 

# CORE

###
  modelize() 
  
  Takes the structure from api.coffee and materializes
  it into a DSL for use qith jQuery.
  
  @returns An augmented Marelle object.
###   
modelize= ()->
    for name, endpoint of API
        modelName   = name.classify()
        model       = (data)->
            for own v, value of data
                @[v] = decorate v, value, @
        for method, spec of endpoint.methods
            http = (spec.http or 'get').toLowerCase() 
            model[method] = ( params, callback )->
                if typeof params is 'function'
                    callback = params
                    params = {}
                return XHR.request.call model, http,  name, method, params, callback
        for aspect, spec of endpoint.aspects
            http = (spec.http or 'get').toLowerCase() 
            aspectName = 'get'+ aspect.classify().pluralize()
            model.prototype[aspectName] = (params, callback)->
                if typeof params is 'function'
                    callback = params
                    params = {}
                return XHR.request.call @, http, name, @.id, aspect, params, callback
        for action, spec of endpoint.actions
            http = (spec.http||'get').toLowerCase() 
            model.prototype[action] = (id, params, callback)->
                if typeof params is 'function'
                    callback = params
                    params = {}
                return XHR.request.call @, http, name, id, action, params, callback
        Marelle[modelName] = model
    return Marelle
###
  decorate()
  
  Decorates a json response from the foursquare API, casting
  nodes to their Marelle equivalent models. 
  
  @params {String} type The type of object we want ot decorate. 
  @params {Object} json The json data represnting this object.
  @params {Object} parent The parent object, if any.
  
  @returns The provided json, decorated.
###         
decorate = (type, json, parent)->
    model = String.prototype.classify.call( type )
    parent[type + 'Count'] = json.count if parent and typeof json.count isnt 'undefined' 
    if Marelle[model] && typeof json is 'object'
        if json.count
            if json.items
                nuitems = []
                json.items.forEach (item)->
                    nuitems.push  new Marelle[model](item) 
                json.items = nuitems;
            return json
        else
            return new Marelle[klass](json)
    else if type is 'groups'
        json.forEach (group, idx)->
            json[idx].items.forEach (item, i)->
                json[idx].items[i] = decorate 'venues', item
    return json

# Auth

###
  synchronize()
  
  Looks for an access_token or error argument within the 
  location hash in order to setup the Marelle.AUTH_TOKEN 
  parameter
### 
synchronize =->
    winhash = window.location.hash
    hashregex = 
        token: /^\#?access_token\=([^\&]+)/ 
        error: /^\#?error\=([^\&]+)/
    if hashregex.error.test winhash
        window.location.hash = ''
        throw 'Foursquare Authentication Error: ' + grep(winhash, hashregex.error)
    else
        if hashregex.token.test winhash
            window.location.hash = ''
            setToken grep( winhash, hashregex.token )
        Marelle.AUTH_TOKEN = getToken() unless Marelle.AUTH_TOKEN 
    return Marelle

###
  setToken()
  
  Sets the visitor's oauth token within localStorage.
  
  @params {String} token The oauth token string.
###        
setToken=(token)->
    localStorage.setItem 'marelleAuthToken', token
###
  getToken()
  
  Gets the visitor's oauth token within localStorage
  
###    
getToken=->
    return localStorage.getItem 'marelleAuthToken' 

###
  clearToken()
  
  Clear the visitor's oauth token from within localStorage
  
###
clearToken=->
    localStorage.removeItem 'marelleAuthToken' 

###
  redirect()
  
  Redirect the browser to the provided URL (removing empty hash if present)
  @param {String} url The URL to redirect to
  
###  
redirect=(url)->
    window.location.href = url.replace /\#$/, '' 

###

  Marelle
  =======
  
  Marelle's public interface. 
  
###
Marelle =
    startSession: ->
        startURL  = "https://foursquare.com/oauth2/authenticate?"
        startURL += "client_id=#{Marelle.CLIENT_ID}&response_type=token&redirect_uri="
        startURL += window.location.href.replace /\#.+/, ''
        redirect startURL
        
    endSession: ->
        clearToken()
        redirect window.location.href
        
    signinButton: (el)->
        el ||= document.body
        holder = $ el
        button = $ '<a class="marelle-sign-in-button" href="#">click to connect to foursquare</a>'
        button.bind 'click', (e)->
            e.preventDefault()
            Marelle.startSession()
        holder.append(button)
        
    signoutButton: (el)->
        el ||= document.body
        holder = $ el
        button = $ '<a class="marelle-sign-out-button" href="#">click to disconnect from foursquare</a>'
        button.bind 'click', (e)->
            e.preventDefault()
            Marelle.endSession()
        holder.append(button)
        
    authenticateVisitor: ()->
        request = XHR.request 'get','users','self', {}
        request.done (json)->
            $.Marelle.Visitor = new Marelle.User json
        request.fail ()->
            delete $.Marelle.Visitor
        return request
# create models
modelize Marelle, API

###
  jQuery bootstrap.
###

$.extend
    Marelle: ( clientID )->
        deferred          = $.Deferred()
        Marelle.CLIENT_ID = clientID || Marelle.CLIENT_ID
        synchronize( Marelle )
        deferred.resolve Marelle
        return deferred.promise()
        
$.extend $.Marelle, Marelle