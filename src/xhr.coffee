###
 XHR 
 
 Provides a marelle-specific interface to jQuery's $.Ajax
 
###

XHR=
  getOpts: (args)->
    args     = Array::slice.call args
    method   = args.shift()
    params   = if typeof args[args.length-1] isnt 'object'   then {}   else args.pop()
    options=
      path: args.join('/'),
      method: method.toUpperCase(),
      params: $.extend( {}, params , { oauth_token: Marelle.AUTH_TOKEN } )
    return options
  request: (method, params )->
    deferred = $.Deferred()
    opts   = XHR.getOpts arguments
    url    = "https://api.foursquare.com/v2/#{opts.path}"
    xhropts= 
      type: opts.method
      url:  url
      data: opts.params
      dataType: 'json'
    return $.ajax xhropts
