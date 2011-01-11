$.marelle() v0.1 unstable, untested
===================================

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

Marelle API
=============

$.marelle
---------

### method

- $.marelle.getAuthenticatedUser( callback )

- $.marelle.startSession()

- $.marelle.endSession()

- $.marelle.signinButton()

- $.marelle.signoutButton()

- $.marelle.bind()

- $.marelle.unbind()

- $.marelle.trigger()

- $.marelle.once()

$.marelle.User()
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


$.marelle.Venue()
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

$.marelle.Checkin()
---------------------

### methods


- Checkin.add( params, callback )

    params: { venueId: "", venue: "", shout: "", broadcast: "", ll: "", llAcc: "", alt: "", altAcc: "" }

- Checkin.recent( params, callback )

    params: { ll: "", limit: "", offset: "", afterTimestamp: "" }

$.marelle.Tip()
-----------------

### methods


- Tip.add( params, callback )

    params: { venueId: "", text: "", url: "" }

- Tip.search( params, callback )

    params: { ll: "", limit: "", offset: "", filter: "", query: "" }

$.marelle.Photo()
-------------------

### methods


- Photo.add( params, callback )

    params: { checkingId: "", tipId: "", venueId: "", broadcast: "", ll: "", llAcc: "", alt: "", altAcc: "" }

$.marelle.Setting()
---------------------

### methods


- Setting.all( callback )

LICENSE
-------


    Copyright 2011-Present PraizedMedia Inc. 

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
