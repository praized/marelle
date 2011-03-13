/*
 XHR

 Provides a marelle-specific interface to jQuery's $.Ajax

*/var XHR;
XHR = {
  getOpts: function(args) {
    var method, options, params;
    args = Array.prototype.slice.call(args);
    method = args.shift();
    params = typeof args[args.length - 1] !== 'object' ? {} : args.pop();
    options = {
      path: args.join('/'),
      method: method.toUpperCase(),
      params: $.extend({}, params, {
        oauth_token: Marelle.AUTH_TOKEN
      })
    };
    return options;
  },
  request: function(method, params) {
    var deferred, opts, url, xhropts;
    deferred = $.Deferred();
    opts = XHR.getOpts(arguments);
    url = "https://api.foursquare.com/v2/" + opts.path.replace(/\/+/g,'/');
    xhropts = {
      type: opts.method,
      url: url,
      data: opts.params,
      dataType: 'json'
    };
    return $.ajax(xhropts);
  }
};