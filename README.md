javascript-us
=============

NPM module of US state metadata.  Heavily based on [python-us](https://github.com/unitedstates/python-us)

* all US states and territories
* postal abbreviations
* Associated Press style abbreviations
* FIPS codes
* capitals
* years of statehood
* time zones
* phonetic state name lookup
* URLs to shapefiles for state, census, congressional districts,
  counties, and census tracts

Installation
------------

As per usual:

    $ npm install us

Features
--------

Easy access to state information:

    > var us = require('us')
    > us.states.MD
    { name: 'Maryland',
      name_metaphone: 'MRLNT',
      statehood_year: 1788,
      ap_abbr: 'Md.',
      is_territory: false,
      fips: '24',
      abbr: 'MD',
      capital: 'Annapolis',
      capital_tz: 'America/New_York',
      time_zones: [ 'America/New_York' ] }
    > us.states.MD.fips
    '24'
    > us.states.MD.name
    'Maryland'
    > 

Includes territories too:

    > us.states.VI.name
    'Virgin Islands'
    > us.states.VI.is_territory
    true
    > us.states.MD.is_territory
    false
    > 

List of all (actual) states:

    > us.STATES
    [ { name: 'Alabama',
        ... },
      { name: 'Alaska',
        ... }, ...
    > us.TERRITORIES
    [ { name: 'American Samoa',
        ... },
      { name: 'Guam',
        ... }, ...

And the whole shebang, if you want it:

    > us.STATES_AND_TERRITORIES
    [ { name: 'Alabama',
        ... },
      { name: 'Alaska',
        ... }, ...
      { name: 'American Samoa',
        ... }, ...

The lookup method allows matching by FIPS code, abbreviation, and name:

    > us.lookup('24')
    { name: 'Maryland',
      ... }
    > us.lookup('MD')
    { name: 'Maryland',
      ... }
    > us.lookup('md')
    { name: 'Maryland',
      ... }
    > us.lookup('maryland')
    { name: 'Maryland',
      ... }
    > 

And for those days that you just can't remember how to spell Mississippi,
we've got phonetic name matching too: ::

    > us.lookup('misisipi')
    { name: 'Mississippi'
      ... }


Shapefiles
----------

You want shapefiles too? Gotcha covered.

    > us.states.MD.shapefile_urls()
    { tract: 'http://www2.census.gov/geo/tiger/TIGER2010/TRACT/2010/tl_2010_24_tract10.zip',
      cd: 'http://www2.census.gov/geo/tiger/TIGER2010/CD/111/tl_2010_24_cd111.zip',
      county: 'http://www2.census.gov/geo/tiger/TIGER2010/COUNTY/2010/tl_2010_24_county10.zip',
      state: 'http://www2.census.gov/geo/tiger/TIGER2010/STATE/2010/tl_2010_24_state10.zip',
      zcta: 'http://www2.census.gov/geo/tiger/TIGER2010/ZCTA5/2010/tl_2010_24_zcta510.zip',
      block: 'http://www2.census.gov/geo/tiger/TIGER2010/TABBLOCK/2010/tl_2010_24_tabblock10.zip',
      blockgroup: 'http://www2.census.gov/geo/tiger/TIGER2010/BG/2010/tl_2010_24_bg10.zip' }

The `shapefile_urls()` method on the State object generates shapefile URLs for the following regions:

* state
* county
* congressional district
* zcta
* census tract

If you know what region you want, you can explicitly request it:

    > us.states.MD.shapefile_urls('county')
    'http://www2.census.gov/geo/tiger/TIGER2010/COUNTY/2010/tl_2010_24_county10.zip'
    

Mappings
--------

Mappings between various state attributes are a common need. The `mapping()` method will generate a lookup between two specified fields.

    > us.mapping('fips', 'abbr');
    { '10': 'DE',
      '11': 'DC', ...
    > us.mapping('abbr', 'name')
    { AL: 'Alabama',
      AK: 'Alaska', ...


Contributing
------------

Your contributions are welcomed!

Credits
-------

* Documentation, code, and pretty much everything heavily based off [python-us](https://github.com/unitedstates/python-us)
* Ported to javascript by [Patrick Way](https://github.com/patsplat)
* Contains [metaphone.js](https://github.com/kvz/phpjs/blob/master/functions/strings/metaphone.js) from [phpjs](https://github.com/kvz/phpjs)

Contributors to python-us:

* [Paul Tagliamonte](http://github.com/paultag)
* [Jeremy Carbaugh](http://github.com/jcarbaugh)
