'use strict';

const test = require( 'tape' );

test( 'imports correctly', t => {
    const us = require( '../us.js' );
    t.ok( us, 'imported library' );
    t.ok( us && us.states && typeof us.states === 'object', 'exports "states" object' );
    t.ok( us && us.STATES && typeof us.STATES === 'object', 'exports "STATES" object' );
    t.ok( us && us.STATES_AND_TERRITORIES && typeof us.STATES_AND_TERRITORIES === 'object', 'exports "STATES_AND_TERRITORIES" object' );
    t.ok( us && us.lookup && typeof us.lookup === 'function', 'exports "lookup" method' );
    t.ok( us && us.mapping && typeof us.mapping === 'function', 'exports "mapping" method' );
    t.end();
} );