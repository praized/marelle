UNDER CONSTRUCTION
==================

This lib is not ready yet. 

TODO 

  - Templates
  - Examples
  - Docu
  - Qunit
  - ...amongst other things.

*****

Hopscotch API
=============

$.hopscotch
---------

### method

- $.hopscotch.getCurrentUser( callback )

- $.hopscotch.startSession()

- $.hopscotch.endSession()

$.hopscotch.User()
------------------

### methods

- User.search( params, callback )

    params: { phone: "", email: "", twitter: "", twitterSource: "", fbid: "", name: "" }

- User.requests( callback )


### instance methods

- badges( callback )


- checkins( params, callback )

    params: { limit: "", offset: "", afterTimestamp: "", beforeTimestamp: "" }

- friends( callback )

- tips( params, callback )

    params: { sort: "", ll: "" }

- todos( params, callback )

    params: { sort: "", ll: "" }

- venuehistory( callback )


$.hopscotch.Venue()
-------------------

### methods

- Venue.add( params, callback )

    params: { name: "", address: "", crossStreet: "", city: "", state: "", zip: "", phone: "", ll: "", primaryCategoryId: "" }

- Venue.categories( callback )

- Venue.search( params, callback )

    params: { ll: "", llAcc: "", alt: "", altAcc: "", query: "", limit: "", intent: "" }

### instance methods

- herenow( callback )

- tips( params, callback )

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
