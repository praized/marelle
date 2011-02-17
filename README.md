$.Marelle() v0.2 unstable, untested
============================================================================================================

Foursquare API client library for Javascript, meant to be used with jquery 1.5+, written in coffeescript. 

*Use at your own risks and perils, yet you are welcome to contribute, share, open issues, critique, criticize, or indulge in your preferred manner of constructive contribution.*

Major Changes
--------------------------------------------------------------------------------------------------------- 

I've slimmed down a lot of stuff in the process of rewriting in coffeescript an decided
upon dropping events for promises, dropping ajax callback support alltogether in favor of promises and 
dropped the cookie fallback for browsers that dont support localStorage and various other tidbits regarding
support for older browsers have been dropped completely also. I've also dropped my stupid ajax caching so 
that becomes your worries not mine, duck-punch some function or whatever. 

TODO
--------------------------------------------------------------------------------------------------------- 

  - Finish & Make Public Qunit Tests.
  - commonjs package and teleport.js ... maybe npm
  - ...amongst other things.

Dependencies
---------------------------------------------------------------------------------------------------------

  - <del>[jQuery 1.4.4](http://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js)</del> (deprecated, use 1.5+)
  - <ins>[jQuery 1.5](http://ajax.googleapis.com/ajax/libs/jquery/1.5/jquery.min.js)</ins>
  - [inflection.js](http://code.google.com/p/inflection-js/) provided in /vendor

(un)Known Issues
---------------------------------------------------------------------------------------------------------

  - Will conflict with various location.hash/hashchange implementations.
  - Works exclusively using Cross-Origin Resource Sharing (CORS)

Questions/Issues
---------------------------------------------------------------------------------------------------------

  - [ask questions here](https://github.com/praized/marelle/issues/labels/question)
  - [open issues here](https://github.com/praized/marelle/issues)

Fiddle
---------------------------------------------------------------------------------------------------------

 - [(possibly outdated and broken) Js Fiddle example](http://fiddle.jshell.net/quickredfox/kBrhM/15/show)

QuickExample
--------------------------------------------------------------------------------------------------------


	// Supply your foursquare client id
	 var FSQUARE_CLIENT_ID = 'FOURSQUARE_CLIENT_ID';
	// on DOM ready...
	 $(function() {
		   // setup with your key and a callback function which 
		   // receives the Marelle Object ( "M" in this example )
		   $.Marelle( FSQUARE_CLIENT_ID ).done( function( M ){
				// grab an authentication promise 
			   var authpromise = M.authenticateVisitor();
			   //  handle logged-in visitor
			   var authsuccess = function(visitor){
				   M.signoutButton( document.body );
				   console.log(visitor)
					/*
						I think the single entry point is through the visitor
					*/
					venuepromise = visitor.getVenues()
					// venuepromise.then etc..etc...
			   };
			   // handle non visitor
			   var authfailure = function() {
				   M.signinButton( document.body );
			   };
			   // wait for promise to resolve
			   authpromise.then(authsuccess,authfailure)
			
		   }).fail(function(){
				consoloe.log('Marelle could not be loaded.')
		   });
	   });


*****

Marelle API v0.2
============================================================================================================

Note: Lotsa lotsa changes! Mainly though: events and support for conventional ajax callbacks have been removed, 
use promises instead.

Methods
============================================================================================================

Marelle exports some of it's methods to jQuery through the $.Marelle variable.

$.Marelle( clientID )
---------------------------------------------------------------------------------------------------------

	Triggers Marelle initialization and returns a promise that 
	will resolve to the completely initialized Marelle object.

	@param {String} clientId - Your Foursquare API Client ID

$.Marelle.authenticateVisitor(  )
---------------------------------------------------------------------------------------------------------

	Triggers authentication verifications and returns a promise 
	that will resolve as the Marelle.Visitor user instance or be
	rejected (means visitor not connected to fsquare)

$.Marelle.startSession(  )
---------------------------------------------------------------------------------------------------------

	Redirects to the foursquare login.
	
$.Marelle.endSession(  )
---------------------------------------------------------------------------------------------------------

	Clears the session.
	
$.Marelle.signinButton( selector )
---------------------------------------------------------------------------------------------------------

	Appends a "connect" button to the provided selector
	
	@param {jQuery} selector - Selector or Element or jQuery object 

$.Marelle.signoutButton( selector )
---------------------------------------------------------------------------------------------------------

	Appends a "disconnect" button to the provided selector
	
	@param {jQuery} selector - Selector or Element or jQuery object 
	
Modeled Objects
============================================================================================================

Every time an AJAX request is made to the FourSquare API through Marelle, 
the returned JSON object gets decorated using a JSON representation of 
the FourSquare API documentation augmented with some fetcher methods during 
Marelle's internal initialization. This means that all these methods promise 
to resolve as the original FourSquare API response structure with "meta" and 
"response" as the first level attributes. Marelle also decorates parent objects 
with an {attribute}Count variable whenever it encounters a collection of items
when recognizably structured so by the foursquare API.

$.Marelle.User(json)
---------------------------------------------------------------------------------------------------------

### Methods
	
	search( params ) // {'phone', 'email', 'twitter', 'twitterSource', 'fbid', 'name'}
	requests()
	
### Aspects

	getBages()
	getCheckins( params ) // {'limit', 'offset', 'afterTimestamp', 'beforeTimestamp'}
	getFriends()
	getTips( params ) // {'sort', 'll'}
	getTodos( params ) // {'sort', 'll'}
	getVenuehistories()

### Actions

	request()
	unfriend()
	approve()
	deny()
	setpings( params ) // {'value'}

$.Marelle.Venue(json)
---------------------------------------------------------------------------------------------------------

### Methods
	
	add( params ) // {name:, address:, crossStreet:, city:, state:, zip:, phone:, ll:, primaryCategoryId:}
				
	categories()
	
	search( params ) // {ll:, llAcc:, alt:, altAcc:, query:, limit:, intent:}

### Aspects

	getHerenow()
	
	getTips( params ) // {sort:}
	
### Actions
	
	marktodo( params ) // {text:}
	flag( params ) // {problem:}
	proposeedit() // {name:, address:, crossStreet:, city:, state:, zip:, phone:, ll:, primaryCategoryId:}

$.Marelle.Checkin(json)
---------------------------------------------------------------------------------------------------------

### Methods

	add( params ) // {venueId:, venue:, shout:, broadcast:, ll:, llAcc:, alt:, altAcc:}
	recent( params ) // {ll:, limit:, offset:, afterTimestamp:}

### Actions

	addcomment( params ) // {text:}
	deletecomment( params ) // {commentId:}

$.Marelle.Tip(json)
---------------------------------------------------------------------------------------------------------

### Methods

	add( params ) // {venueId:, text:, url:}
	search( params ) // {ll:, limit:, offset:, filter:, query:}
	
### Actions

	marktodo()
	markdone()
	unmark()

$.Marelle.Photo(json)
---------------------------------------------------------------------------------------------------------

### Methods

	add( params ) // {checkingId:, tipId:, venueId:, broadcast:, ll:, llAcc:, alt:, altAcc:}
	
$.Marelle.Setting(json)
---------------------------------------------------------------------------------------------------------

### Methods

	all()

### Actions

	set( params ) // {value:}