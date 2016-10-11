'use strict';

const test = require('tape');

test('name lookups', t => {

    const us = require('../us.js');

    us.STATES.forEach( state => {
        const result = us.lookup( state.name );
        t.deepEqual( result, state, `${ state.name } => ${ state.name }`);
        if ( !result || result.abbr !== state.abbr ) {
            console.log( `${ state.name } = metaphone: ${ us._metaphone( state.name ) }` );
        }
    } );

    t.end();
} );

test('abbreviation lookups', t => {

    const us = require('../us.js');

    us.STATES.forEach( state => {
        const result = us.lookup( state.abbr );
        t.deepEqual( result, state, `${ state.abbr } => ${ state.name }`);
    } );

    t.end();
} );

test('fips lookups', t => {

    const us = require('../us.js');

    us.STATES.forEach( state => {
        const result = us.lookup( state.fips );
        t.deepEqual( result, state, `${ state.fips } => ${ state.name }`);
    } );

    t.end();
} );