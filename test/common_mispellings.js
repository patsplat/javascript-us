'use strict';

const test = require('tape');

const LOOKUP_STRINGS = {
    'Allabama': 'AL',
    'Alabamma': 'AL',

    'Alsaka': 'AK',

    'Arizonia': 'AZ',
    'Arzinoa': 'AZ',

    'Califronia': 'CA',

    'Calorado': 'CO',
    'Colarado': 'CO',

    'Connecticutt': 'CT',
    'Conneticutt': 'CT',
    'Connetticut': 'CT',
    'Connetticutt': 'CT',
    'Conneticut': 'CT',

    'Delawere': 'DE',

    'Floridas': 'FL',
    'Floryda': 'FL',
    'Florda': 'FL',
    'Flordia': 'FL',

    'Georgeia': 'GA',
    'Georgea': 'GA',

    'Hawai': 'HI',
    'Howaii': 'HI',
    'Hawii': 'HI',
    'Hawaai': 'HI',

    'Idahoe': 'ID',
    'Ideho': 'ID',

    'Illanoise': 'IL',

    'Iowha': 'IA',
    'Ioaw': 'IA',
    'Iwoa': 'IA',

    'Kentuky': 'KY',
    'Kentucy': 'KY',

    'Louiseiana': 'LA',

    'Main': 'ME',
    'Miane': 'ME',

    'Mary land': 'MD',
    'Marryland': 'MD',

    'Massachussetts': 'MA',
    'Masachusetts': 'MA',
    'Masachusets': 'MA',
    'Massachussets': 'MA',

    'Michgan': 'MI',
    'Michagin': 'MI',
    'Michagan': 'MI',

    'Minesota': 'MN',

    'Mississipi': 'MS',
    'Missisipi': 'MS',
    'Missisippi': 'MS',

    'Misouri': 'MO',
    'Missoury': 'MO',

    'Nebrascka': 'NE',

    'Nevadaa': 'NV',
    'Newvada': 'NV',
    'Navada': 'NV',

    'NewHampshire': 'NH',

    'NewJersey': 'NJ',

    'NewMexico': 'NM',

    'NewYork': 'NY',

    'North Caroleina': 'NC',

    'N.dak': 'ND',
    'Northdakota': 'ND',
    'Ndak': 'ND',

    'Oiho': 'OH',

    'Okalahoma': 'OK',

    'Orgon': 'OR',

    'Pensylvania': 'PA',

    'Road Island': 'RI',
    'RhodeIsland': 'RI',
    'Rode Island': 'RI',
    'Rhod Island': 'RI',

    'SouthCarolina': 'SC',
    'Sout Carolin': 'SC',
    'South Carolna': 'SC',
    'Souh Carolia': 'SC',
    'South Carolina': 'SC',

    'SouthDakota': 'SD',

    'Tennesee': 'TN',
    'Tennisse': 'TN',
    'Tennissee': 'TN',
    'Tennisee': 'TN',

    'Texes': 'TX',
    'Texis': 'TX',

    'Utes': 'UT',
    'Utar': 'UT',

    'West Virgina': 'WV',
    'West Virgnia': 'WV',

    'Whyoming': 'WY',
    'Wioming': 'WY',

    'Wisconson': 'WI'

};

test('common misspellings', t => {

    const us = require('../us.js');

    Object.keys(LOOKUP_STRINGS).forEach(lookup_key => {
        const expected_result = LOOKUP_STRINGS[lookup_key];
        const result = us.lookup(lookup_key);
        t.equal(result && result.abbr, expected_result, `${ lookup_key } => ${ expected_result }`);
        if (!result || result.abbr !== expected_result) {
            console.log(`${ lookup_key } = metaphone: ${ us._metaphone( lookup_key ) }`);
        }
    });

    t.end();
});