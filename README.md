$.marelle() v0.1 unstable, untested
===================================

Use at your own risks and perils, yet you are welcome to contribute, share, open issues, critique, criticize, or indulge in your preferred manner of constructive contribution.

TODO
---- 

  - Moar Examples
  - Moar Docs
  - Finish & Make Public Qunit Tests.
  - Decide on browser support
  - Remove hacks for non supported browsers.
  - Remove and Re-Document unsupported calls
  - Stabilize API? -> I see no way to make it upgradeable if FS API changes.
  - ...amongst other things.

Dependencies
------------

  - [jQuery 1.4.4](http://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js)
  - [inflection.js](http://code.google.com/p/inflection-js/)

(un)Known Issues
----------------

  - Probably conflicts badly with various location.hash/hashchange implementations, an iframe hack would solve that but I don't think I need it for now, welcoming suggestions. 
  - POST methods (actions) are not currently implemented due to transport limitations.

Questions/Issues
----------------

  - [ask questions here](https://github.com/praized/hopscotch/issues/labels/question)
  - [open issues here](https://github.com/praized/hopscotch/issues)

*****

Marelle API
=============

$.marelle
---------

### method

- $.marelle.getAuthenticatedUser( ) 
        
		// returns a MarelleUser instance
		
	    $.marelle.getAuthenticatedUser( ) 

- $.marelle.startSession()

        // redirects browser to foursquare oAuth process

		$.marelle.startSession()

- $.marelle.endSession()

		// clears token and refreshes page 
		
		$.marelle.endSession()

- $.marelle.signinButton( containerNodeOrSelector )

      	/* 
		    Injects a button with proper event 
		    handlers for startSession() & endSession()
		    example container markup: 
				<menu id="auth"></menu>
		*/
		
		$.marelle.signinButton('#auth')

- $.marelle.signoutButton( containerNodeOrSelector  )

		// same as signinButton
		
		$.marelle.signoutButton('#auth')		

- $.marelle.bind( eventName, callbackFunction )

		/* 
		   Binds an event handler "callbackFunction" 
		   for an event of type "eventName"
		*/
		
		var handler = function( event, user ){
			// user is a MarelleUser instance
		};
		
		$.marelle.bind( 'connected', handler )

- $.marelle.unbind( eventName, [callbackFunction] )

		/* 
			Unbinds an event handler "callbackFunction" 
			for an event of type "eventName"
		*/
		
		var handler = function( event, user ){
			// user is a MarelleUser instance
		};
		
		$.marelle.unbind( 'connected', handler )


- $.marelle.trigger( eventName, [data] )

		/* 
			Fires an event of type "eventName", 
			sending it an optional "data" Array;
		*/

		var user = $.marelle.getAuthenticatedUser( );
		
		$.marelle.trigger( 'connected', [ user ] )

- $.marelle.once( eventName, callbackFunction )

		/* 
		   Binds an event handler "callbackFunction" 
		   for an event of type "eventName" that
  		   is only fired once.
		*/
		
		var handler = function( event, user ){
			// user is a MarelleUser instance
		};
		
		$.marelle.once( 'connected', handler )

### Events

- ready
- connected
- disconnected

$.marelle.User()
------------------

### methods

- User.search( params, callback )

    params: { phone: , email: , twitter: , twitterSource: , fbid: , name:  }

		/* 
			Sends a pre-configured JSONP call with supplied parameters
		*/
		
		User.search({name:'quickredfox'},function(response){
			// MarelleUser instance can be found:
			doSomethingWith( response.user )
		});

- User.requests( callback )

		/* 
			Sends a pre-configured JSONP call.
		*/

		User.requests(function(response){
			// response is a decorated json object.
			doSomethingWith( response.requests )
		});

### instance methods

- getBadges( callback )

		/* 
			Sends a pre-configured JSONP call.
			... and the rest of the methods pretty
			much works the same.
		*/
		
		var current = $.marelle.getAuthenticaredUser();

		current.getBadges(function(response){
			// do something with response
		})

- getCheckins( params, callback )

    params: { limit: , offset: , afterTimestamp: , beforeTimestamp:  }

- getFriends( callback )

- getTips( params, callback )

    params: { sort: , ll:  }

- getTodos( params, callback )

    params: { sort: , ll:  }

- getVenuehistories( callback )


$.marelle.Venue()
-------------------

### methods

- Venue.add( params, callback )

    params: { name: , address: , crossStreet: , city: , state: , zip: , phone: , ll: required , primaryCategoryId:  }

- Venue.categories( callback )

- Venue.search( params, callback )

    params: { ll: , llAcc: , alt: , altAcc: , query: , limit: , intent:  }

### instance methods

- getHerenow( callback )

- getTips( params, callback )

    params: { sort:  }

$.marelle.Checkin()
---------------------

### methods


- Checkin.add( params, callback )

    params: { venueId: , venue: , shout: , broadcast: , ll: , llAcc: , alt: , altAcc:  }

- Checkin.recent( params, callback )

    params: { ll: , limit: , offset: , afterTimestamp:  }

$.marelle.Tip()
-----------------

### methods


- Tip.add( params, callback )

    params: { venueId: , text: , url:  }

- Tip.search( params, callback )

    params: { ll: , limit: , offset: , filter: , query:  }

$.marelle.Photo()
-------------------

### methods


- Photo.add( params, callback )

    params: { checkingId: , tipId: , venueId: , broadcast: , ll: , llAcc: , alt: , altAcc:  }

$.marelle.Setting()
---------------------

### methods


- Setting.all( callback )

LICENSE
-------


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
