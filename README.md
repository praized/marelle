UNSTABLE, UNDER CONSTRUCTION
============================

This lib is not ready yet. 

TODO 

  - Update Examples
  - Update Docs after example updates
  - Qunit
  - Decide on browser support
  - Remove hacks for non supported browsers.
  - Remove and Re-Document unsupported calls
  - ...amongst other things.

*****

Hopscotch API
=============

$.hopscotch
---------

### method

- $.hopscotch.getAuthenticatedUser( callback )

- $.hopscotch.startSession()

- $.hopscotch.endSession()

- $.hopscotch.signinButton()

- $.hopscotch.signoutButton()

- $.hopscotch.bind()

- $.hopscotch.unbind()

- $.hopscotch.trigger()

- $.hopscotch.once()

$.hopscotch.User()
------------------

### methods

- User.search( params, callback )

    params: { phone: "", email: "", twitter: "", twitterSource: "", fbid: "", name: "" }

- User.requests( callback )


### instance methods

- getBadges( callback )


- getCheckins( params, callback )

    params: { limit: "", offset: "", afterTimestamp: "", beforeTimestamp: "" }

- getFriends( callback )

- getTips( params, callback )

    params: { sort: "", ll: "" }

- getTodos( params, callback )

    params: { sort: "", ll: "" }

- getVenuehistories( callback )


$.hopscotch.Venue()
-------------------

### methods

- Venue.add( params, callback )

    params: { name: "", address: "", crossStreet: "", city: "", state: "", zip: "", phone: "", ll: "", primaryCategoryId: "" }

- Venue.categories( callback )

- Venue.search( params, callback )

    params: { ll: "", llAcc: "", alt: "", altAcc: "", query: "", limit: "", intent: "" }

### instance methods

- getHerenow( callback )

- getTips( params, callback )

    params: { sort: "" }

$.hopscotch.Checkin()
---------------------

### methods


- Checkin.add( params, callback )

    params: { venueId: "", venue: "", shout: "", broadcast: "", ll: "", llAcc: "", alt: "", altAcc: "" }

- Checkin.recent( params, callback )

    params: { ll: "", limit: "", offset: "", afterTimestamp: "" }

$.hopscotch.Tip()
-----------------

### methods


- Tip.add( params, callback )

    params: { venueId: "", text: "", url: "" }

- Tip.search( params, callback )

    params: { ll: "", limit: "", offset: "", filter: "", query: "" }

$.hopscotch.Photo()
-------------------

### methods


- Photo.add( params, callback )

    params: { checkingId: "", tipId: "", venueId: "", broadcast: "", ll: "", llAcc: "", alt: "", altAcc: "" }

$.hopscotch.Setting()
---------------------

### methods


- Setting.all( callback )
