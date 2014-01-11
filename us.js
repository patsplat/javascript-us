(function() {
  var us = {};

  var root = this;
  if (typeof exports !== 'undefined') {
      if (typeof module !== 'undefined' && module.exports) {
          exports = module.exports = us;
      }
      exports.us = us;
  } else {
      root.us = us;
  }

  us.states = {};
  us.STATES = [];
  us.TERRITORIES = [];
  us.STATES_AND_TERRITORIES = [];

  us.State = function(data) {
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        this[key] = data[key];
      }
    }
  };
  us.State.prototype.toString = function() { return this.name; };
  us.State.prototype.shapefile_urls = function(region) {
    var base_url = "http://www2.census.gov/geo/tiger/TIGER2010";
    var urls = {
      'tract': base_url + '/TRACT/2010/tl_2010_' + this.fips.toString() + '_tract10.zip',
      'cd': base_url + '/CD/111/tl_2010_' + this.fips.toString() + '_cd111.zip',
      'county': base_url + '/COUNTY/2010/tl_2010_' + this.fips.toString() + '_county10.zip',
      'state': base_url + '/STATE/2010/tl_2010_' + this.fips.toString() + '_state10.zip',
      'zcta': base_url + '/ZCTA5/2010/tl_2010_' + this.fips.toString() + '_zcta510.zip',
      'block': base_url + '/TABBLOCK/2010/tl_2010_' + this.fips.toString() + '_tabblock10.zip',
      'blockgroup': base_url + '/BG/2010/tl_2010_' + this.fips.toString() + '_bg10.zip'
     };
     if (region && (region in urls)) {
       return urls[region];
     } else {
       return urls;
     }
  };
  /*   Semi-fuzzy state lookup. This method will make a best effort
        attempt at finding the state based on the lookup value provided.

          * two digits will search for FIPS code
          * two letters will search for state abbreviation
          * anything else will try to match the metaphone of state names

        Metaphone is used to allow for incorrect, but phonetically accurate,
        spelling of state names.

        Exact matches can be done on any attribute on State objects by passing
        the `field` argument. This skips the fuzzy-ish matching and does an
        exact, case-sensitive comparison against the specified field.

        This method caches non-None results, but can the cache can be bypassed
        with the `use_cache=False` argument.
    */
  var FIPS_RE = /^\d{2}$/;
  var ABBR_RE = /^[a-zA-Z]{2}$/;
  var _lookup_cache = {};
  us.lookup = function (val, field, dont_cache) {
    if (field == null)  {
      if (val.match(FIPS_RE)) {
        field = 'fips';
      } else if (val.match(ABBR_RE)) {
        val = val.toUpperCase();
        field = 'abbr';
      } else {
        val = metaphone(val);
        field = 'name_metaphone';
      }
    }
    var cache_key = field + ':' + val;
    if (!dont_cache && (cache_key in _lookup_cache)) {
      return _lookup_cache[cache_key];
    }
    for (var i=0; i < us.STATES_AND_TERRITORIES.length; i++) {
      var state = us.STATES_AND_TERRITORIES[i];
      if (val === state[field]) {
        _lookup_cache[cache_key] = state;
        return state;
      }
    }
  };
  
  us.mapping = function(from_field, to_field, states) {
    if (typeof states == 'undefined' || states == null) {
      states = us.STATES_AND_TERRITORIES;
    }
    var mapping = {};
    for (var i=0; i < states.length; i++) {
      var s = states[i];
      mapping[s[from_field]] = s[to_field];
    }
    return mapping;
  };
    
  // https://github.com/kvz/phpjs/blob/master/functions/strings/metaphone.js
  var metaphone = function (word, phones) {
  // +   original by: Greg Frazier
  // +   improved by: Brett Zamir (http://brett-zamir.me)
  // +   improved by: Rafa? Kukawski (http://kukawski.pl)
  // *     example 1: metaphone('Gnu');
  // *     returns 1: 'N'

  word = (word == null ? '' : word + '').toUpperCase();

  function isVowel (a) {
    return 'AEIOU'.indexOf(a) !== -1;
  }

  function removeDuplicates (word) {
    var wordlength = word.length,
      char1 = word.charAt(0),
      char2,
      rebuilt = char1;

    for (var i = 1; i < wordlength; i++) {
      char2 = word.charAt(i);

      if (char2 !== char1 || char2 === 'C' || char2 === 'G') { // 'c' and 'g' are exceptions
        rebuilt += char2;
      }
      char1 = char2;
    }

    return rebuilt;
  }

  word = removeDuplicates(word);

  var wordlength = word.length,
    x = 0,
    metaword = '';

  //Special wh- case
  if (word.substr(0, 2) === 'WH') {
    // Remove "h" and rebuild the string
    word = 'W' + word.substr(2);
  }

  var cc = word.charAt(0); // current char. Short name cause it's used all over the function
  var pc = ''; // previous char. There is none when x === 0
  var nc = word.charAt(1); // next char
  var nnc = ''; // 2 characters ahead. Needed later

  if (1 <= wordlength) {
    switch (cc) {
    case 'A':
      if (nc === 'E') {
        metaword += 'E';
      } else {
        metaword += 'A';
      }
      x += 1;
      break;
    case 'E': case 'I': case 'O': case 'U':
      metaword += cc;
      x += 1;
      break;
    case 'G': case 'K': case 'P':
      if (nc === 'N') {
        x += 1;
      }
      break;
    case 'W':
      if (nc === 'R') {
        x += 1;
      }
      break;
    }
  }

  for (; x < wordlength; x++) {
    cc = word.charAt(x);
    pc = word.charAt(x - 1);
    nc = word.charAt(x + 1);
    nnc = word.charAt(x + 2);

    if (!isVowel(cc)) {
      switch (cc) {
      case 'B':
        if (pc !== 'M') {
          metaword += 'B';
        }
        break;
      case 'C':
        if (x + 1 <= wordlength) {
          if (word.substr(x - 1, 3) !== 'SCH') {
            if (x === 0 && (x + 2 <= wordlength) && isVowel(nnc)) {
              metaword += 'K';
            } else {
              metaword += 'X';
            }
          } else if (word.substr(x + 1, 2) === 'IA') {
            metaword += 'X';
          } else if ('IEY'.indexOf(nc) !== -1) {
            if (x > 0) {
              if (pc !== 'S') {
                metaword += 'S';
              }
            } else {
              metaword += 'S';
            }
          } else {
            metaword += 'K';
          }
        } else {
          metaword += 'K';
        }
        break;
      case 'D':
        if (x + 2 <= wordlength && nc === 'G' && 'EIY'.indexOf(nnc) !== -1) {
          metaword += 'J';
          x += 2;
        } else {
          metaword += 'T';
        }
        break;
      case 'F':
        metaword += 'F';
        break;
      case 'G':
        if (x < wordlength) {
          if ((nc === 'N' && x + 1 === wordlength - 1) || (nc === 'N' && nnc === 'S' && x + 2 === wordlength - 1)) {
            break;
          }
          if (word.substr(x + 1, 3) === 'NED' && x + 3 === wordlength - 1) {
            break;
          }
          if (word.substr(x - 2, 3) === 'ING' && x === wordlength - 1) {
            break;
          }

          if (x + 1 <= wordlength - 1 && word.substr(x - 2, 4) === 'OUGH') {
            metaword += 'F';
            break;
          }
          if (nc === 'H' && x + 2 <= wordlength) {
            if (isVowel(nnc)) {
              metaword += 'K';
            }
          } else if (x + 1 === wordlength) {
            if (nc !== 'N') {
              metaword += 'K';
            }
          } else if (x + 3 === wordlength) {
            if (word.substr(x + 1, 3) !== 'NED') {
              metaword += 'K';
            }
          } else if (x + 1 <= wordlength) {
            if ('EIY'.indexOf(nc) !== -1) {
              if (pc !== 'G') {
                metaword += 'J';
              }
            } else if (x === 0 || pc !== 'D' || 'EIY'.indexOf(nc) === -1) {
              metaword += 'K';
            }
          } else {
            metaword += 'K';
          }
        } else {
          metaword += 'K';
        }
        break;
      case 'M': case 'J': case 'N': case 'R': case 'L':
        metaword += cc;
        break;
      case 'Q':
        metaword += 'K';
        break;
      case 'V':
        metaword += 'F';
        break;
      case 'Z':
        metaword += 'S';
        break;
      case 'X':
        metaword += (x === 0) ? 'S' : 'KS';
        break;
      case 'K':
        if (x === 0 || pc !== 'C') {
          metaword += 'K';
        }
        break;
      case 'P':
        if (x + 1 <= wordlength && nc === 'H') {
          metaword += 'F';
        } else {
          metaword += 'P';
        }
        break;
      case 'Y':
        if (x + 1 > wordlength || isVowel(nc)) {
          metaword += 'Y';
        }
        break;
      case 'H':
        if (x === 0 || 'CSPTG'.indexOf(pc) === -1) {
          if (isVowel(nc) === true) {
            metaword += 'H';
          }
        }
        break;
      case 'S':
        if (x + 1 <= wordlength) {
          if (nc === 'H') {
            metaword += 'X';
          } else if (x + 2 <= wordlength && nc === 'I' && 'AO'.indexOf(nnc) !== -1) {
            metaword += 'X';
          } else {
            metaword += 'S';
          }
        } else {
          metaword += 'S';
        }
        break;
      case 'T':
        if (x + 1 <= wordlength) {
          if (nc === 'H') {
            metaword += '0';
          } else if (x + 2 <= wordlength && nc === 'I' && 'AO'.indexOf(nnc) !== -1) {
            metaword += 'X';
          } else {
            metaword += 'T';
          }
        } else {
          metaword += 'T';
        }
        break;
      case 'W':
        if (x + 1 <= wordlength && isVowel(nc)) {
          metaword += 'W';
        }
        break;
      }
    }
  }

  phones = parseInt(phones, 10);
  if (metaword.length > phones) {
    return metaword.substr(0, phones);
  }
  return metaword;
};

  var load_states = function() {
    for (var i=0; i < load_states.DATA.length; i++) {
      var s = load_states.DATA[i];
      var state = new us.State(s);
      if (state.is_territory) {
        us.TERRITORIES.push(state);
      } else {
        us.STATES.push(state);
      }
      us.STATES_AND_TERRITORIES.push(state);
      us.states[state.abbr] = state;
    }
  };
  load_states.DATA = [
    {"name": "Alabama", "name_metaphone": "ALBM", "statehood_year": 1819, "ap_abbr": "Ala.", "is_territory": false, "fips": "01", "abbr": "AL", "capital": "Montgomery", "capital_tz": "America/Chicago", "time_zones": ["America/Chicago"]},
    {"name": "Alaska", "name_metaphone": "ALSK", "statehood_year": 1959, "ap_abbr": "Alaska", "is_territory": false, "fips": "02", "abbr": "AK", "capital": "Juneau", "capital_tz": "America/Anchorage", "time_zones": ["America/Anchorage", "America/Adak"]},
    {"name": "American Samoa", "name_metaphone": "AMRKN SM", "statehood_year": null, "ap_abbr": null, "is_territory": true, "fips": "60", "abbr": "AS", "capital": "Pago Pago", "capital_tz": "Pacific/Samoa", "time_zones": ["Pacific/Samoa"]},
    {"name": "Arizona", "name_metaphone": "ARSN", "statehood_year": 1912, "ap_abbr": "Ariz.", "is_territory": false, "fips": "04", "abbr": "AZ", "capital": "Phoenix", "capital_tz": "America/Denver", "time_zones": ["America/Denver"]},
    {"name": "Arkansas", "name_metaphone": "ARKNSS", "statehood_year": 1836, "ap_abbr": "Ark.", "is_territory": false, "fips": "05", "abbr": "AR", "capital": "Little Rock", "capital_tz": "America/Chicago", "time_zones": ["America/Chicago"]},
    {"name": "California", "name_metaphone": "KLFRN", "statehood_year": 1850, "ap_abbr": "Calif.", "is_territory": false, "fips": "06", "abbr": "CA", "capital": "Sacramento", "capital_tz": "America/Los_Angeles", "time_zones": ["America/Los_Angeles"]},
    {"name": "Colorado", "name_metaphone": "KLRT", "statehood_year": 1876, "ap_abbr": "Colo.", "is_territory": false, "fips": "08", "abbr": "CO", "capital": "Denver", "capital_tz": "America/Denver", "time_zones": ["America/Denver"]},
    {"name": "Connecticut", "name_metaphone": "KNKTKT", "statehood_year": 1788, "ap_abbr": "Conn.", "is_territory": false, "fips": "09", "abbr": "CT", "capital": "Hartford", "capital_tz": "America/New_York", "time_zones": ["America/New_York"]},
    {"name": "Delaware", "name_metaphone": "TLWR", "statehood_year": 1787, "ap_abbr": "Del.", "is_territory": false, "fips": "10", "abbr": "DE", "capital": "Dover", "capital_tz": "America/New_York", "time_zones": ["America/New_York"]},
    {"name": "District of Columbia", "name_metaphone": "TSTRKT OF KLMB", "statehood_year": null, "ap_abbr": "D.C.", "is_territory": false, "fips": "11", "abbr": "DC", "capital": null, "capital_tz": "America/New_York", "time_zones": ["America/New_York"]},
    {"name": "Florida", "name_metaphone": "FLRT", "statehood_year": 1845, "ap_abbr": "Fla.", "is_territory": false, "fips": "12", "abbr": "FL", "capital": "Tallahassee", "capital_tz": "America/New_York", "time_zones": ["America/New_York", "America/Chicago"]},
    {"name": "Georgia", "name_metaphone": "JRJ", "statehood_year": 1788, "ap_abbr": "Ga.", "is_territory": false, "fips": "13", "abbr": "GA", "capital": "Atlanta", "capital_tz": "America/New_York", "time_zones": ["America/New_York"]},
    {"name": "Guam", "name_metaphone": "KM", "statehood_year": null, "ap_abbr": null, "is_territory": true, "fips": "66", "abbr": "GU", "capital": "Hag\\u00e5t\\u00f1a", "capital_tz": "Pacific/Guam", "time_zones": ["Pacific/Guam"]},
    {"name": "Hawaii", "name_metaphone": "HW", "statehood_year": 1959, "ap_abbr": "Hawaii", "is_territory": false, "fips": "15", "abbr": "HI", "capital": "Honolulu", "capital_tz": "Pacific/Honolulu", "time_zones": ["Pacific/Honolulu"]},
    {"name": "Idaho", "name_metaphone": "ITH", "statehood_year": 1890, "ap_abbr": "Idaho", "is_territory": false, "fips": "16", "abbr": "ID", "capital": "Boise", "capital_tz": "America/Denver", "time_zones": ["America/Denver", "America/Los_Angeles"]},
    {"name": "Illinois", "name_metaphone": "ILNS", "statehood_year": 1818, "ap_abbr": "Ill.", "is_territory": false, "fips": "17", "abbr": "IL", "capital": "Springfield", "capital_tz": "America/Chicago", "time_zones": ["America/Chicago"]},
    {"name": "Indiana", "name_metaphone": "INTN", "statehood_year": 1816, "ap_abbr": "Ind.", "is_territory": false, "fips": "18", "abbr": "IN", "capital": "Indianapolis", "capital_tz": "America/Indiana/Indianapolis", "time_zones": ["America/Indiana/Indianapolis", "America/Indianapolis", "America/Indiana/Winamac", "America/Indiana/Vincennes", "America/Indiana/Vevay", "America/Indiana/Tell_City", "America/Indiana/Petersburg", "America/Indiana/Marengo", "America/Indiana/Knox", "America/Knox_IN"]},
    {"name": "Iowa", "name_metaphone": "IW", "statehood_year": 1846, "ap_abbr": "Iowa", "is_territory": false, "fips": "19", "abbr": "IA", "capital": "Des Moines", "capital_tz": "America/Chicago", "time_zones": ["America/Chicago"]},
    {"name": "Kansas", "name_metaphone": "KNSS", "statehood_year": 1861, "ap_abbr": "Kan.", "is_territory": false, "fips": "20", "abbr": "KS", "capital": "Topeka", "capital_tz": "America/Chicago", "time_zones": ["America/Chicago", "America/Denver"]},
    {"name": "Kentucky", "name_metaphone": "KNTK", "statehood_year": 1792, "ap_abbr": "Ky.", "is_territory": false, "fips": "21", "abbr": "KY", "capital": "Frankfort", "capital_tz": "America/New_York", "time_zones": ["America/New_York", "America/Kentucky/Louisville", "America/Kentucky/Monticello", "America/Louisville"]},
    {"name": "Louisiana", "name_metaphone": "LXN", "statehood_year": 1812, "ap_abbr": "La.", "is_territory": false, "fips": "22", "abbr": "LA", "capital": "Baton Rouge", "capital_tz": "America/Chicago", "time_zones": ["America/Chicago"]},
    {"name": "Maine", "name_metaphone": "MN", "statehood_year": 1820, "ap_abbr": "Maine", "is_territory": false, "fips": "23", "abbr": "ME", "capital": "Augusta", "capital_tz": "America/New_York", "time_zones": ["America/New_York"]},
    {"name": "Maryland", "name_metaphone": "MRLNT", "statehood_year": 1788, "ap_abbr": "Md.", "is_territory": false, "fips": "24", "abbr": "MD", "capital": "Annapolis", "capital_tz": "America/New_York", "time_zones": ["America/New_York"]},
    {"name": "Massachusetts", "name_metaphone": "MSXSTS", "statehood_year": 1788, "ap_abbr": "Mass.", "is_territory": false, "fips": "25", "abbr": "MA", "capital": "Boston", "capital_tz": "America/New_York", "time_zones": ["America/New_York"]},
    {"name": "Michigan", "name_metaphone": "MXKN", "statehood_year": 1837, "ap_abbr": "Mich.", "is_territory": false, "fips": "26", "abbr": "MI", "capital": "Lansing", "capital_tz": "America/New_York", "time_zones": ["America/New_York", "America/Chicago"]},
    {"name": "Minnesota", "name_metaphone": "MNST", "statehood_year": 1858, "ap_abbr": "Minn.", "is_territory": false, "fips": "27", "abbr": "MN", "capital": "Saint Paul", "capital_tz": "America/Chicago", "time_zones": ["America/Chicago"]},
    {"name": "Mississippi", "name_metaphone": "MSSP", "statehood_year": 1817, "ap_abbr": "Miss.", "is_territory": false, "fips": "28", "abbr": "MS", "capital": "Jackson", "capital_tz": "America/Chicago", "time_zones": ["America/Chicago"]},
    {"name": "Missouri", "name_metaphone": "MSR", "statehood_year": 1821, "ap_abbr": "Mo.", "is_territory": false, "fips": "29", "abbr": "MO", "capital": "Jefferson City", "capital_tz": "America/Chicago", "time_zones": ["America/Chicago"]},
    {"name": "Montana", "name_metaphone": "MNTN", "statehood_year": 1889, "ap_abbr": "Mont.", "is_territory": false, "fips": "30", "abbr": "MT", "capital": "Helena", "capital_tz": "America/Denver", "time_zones": ["America/Denver"]},
    {"name": "Nebraska", "name_metaphone": "NBRSK", "statehood_year": 1867, "ap_abbr": "Neb.", "is_territory": false, "fips": "31", "abbr": "NE", "capital": "Lincoln", "capital_tz": "America/Chicago", "time_zones": ["America/Chicago", "America/Denver"]},
    {"name": "Nevada", "name_metaphone": "NFT", "statehood_year": 1864, "ap_abbr": "Nev.", "is_territory": false, "fips": "32", "abbr": "NV", "capital": "Carson City", "capital_tz": "America/Los_Angeles", "time_zones": ["America/Los_Angeles", "America/Denver"]},
    {"name": "New Hampshire", "name_metaphone": "N HMPXR", "statehood_year": 1788, "ap_abbr": "N.H.", "is_territory": false, "fips": "33", "abbr": "NH", "capital": "Concord", "capital_tz": "America/New_York", "time_zones": ["America/New_York"]},
    {"name": "New Jersey", "name_metaphone": "N JRS", "statehood_year": 1787, "ap_abbr": "N.J.", "is_territory": false, "fips": "34", "abbr": "NJ", "capital": "Trenton", "capital_tz": "America/New_York", "time_zones": ["America/New_York"]},
    {"name": "New Mexico", "name_metaphone": "N MKSK", "statehood_year": 1912, "ap_abbr": "N.M.", "is_territory": false, "fips": "35", "abbr": "NM", "capital": "Santa Fe", "capital_tz": "America/Chicago", "time_zones": ["America/Chicago"]},
    {"name": "New York", "name_metaphone": "NYRK", "statehood_year": 1788, "ap_abbr": "N.Y.", "is_territory": false, "fips": "36", "abbr": "NY", "capital": "Albany", "capital_tz": "America/New_York", "time_zones": ["America/New_York"]},
    {"name": "North Carolina", "name_metaphone": "NR0 KRLN", "statehood_year": 1789, "ap_abbr": "N.C.", "is_territory": false, "fips": "37", "abbr": "NC", "capital": "Raleigh", "capital_tz": "America/New_York", "time_zones": ["America/New_York"]},
    {"name": "North Dakota", "name_metaphone": "NR0 TKT", "statehood_year": 1889, "ap_abbr": "N.D.", "is_territory": false, "fips": "38", "abbr": "ND", "capital": "Bismarck", "capital_tz": "America/North_Dakota/Center", "time_zones": ["America/North_Dakota/Center", "America/North_Dakota/Beulah", "America/North_Dakota/Center", "America/North_Dakota/New_Salem"]},
    {"name": "Northern Mariana Islands", "name_metaphone": "NR0RN MRN ISLNTS", "statehood_year": null, "ap_abbr": null, "is_territory": true, "fips": "69", "abbr": "MP", "capital": "Saipan", "capital_tz": "Pacific/Guam", "time_zones": ["Pacific/Guam"]},
    {"name": "Ohio", "name_metaphone": "OH", "statehood_year": 1803, "ap_abbr": "Ohio", "is_territory": false, "fips": "39", "abbr": "OH", "capital": "Columbus", "capital_tz": "America/New_York", "time_zones": ["America/New_York"]},
    {"name": "Oklahoma", "name_metaphone": "OKLHM", "statehood_year": 1907, "ap_abbr": "Okla.", "is_territory": false, "fips": "40", "abbr": "OK", "capital": "Oklahoma City", "capital_tz": "America/Chicago", "time_zones": ["America/Chicago"]},
    {"name": "Oregon", "name_metaphone": "ORKN", "statehood_year": 1859, "ap_abbr": "Ore.", "is_territory": false, "fips": "41", "abbr": "OR", "capital": "Salem", "capital_tz": "America/Los_Angeles", "time_zones": ["America/Los_Angeles", "America/Boise"]},
    {"name": "Pennsylvania", "name_metaphone": "PNSLFN", "statehood_year": 1787, "ap_abbr": "Pa.", "is_territory": false, "fips": "42", "abbr": "PA", "capital": "Harrisburg", "capital_tz": "America/New_York", "time_zones": ["America/New_York"]},
    {"name": "Puerto Rico", "name_metaphone": "PRT RK", "statehood_year": null, "ap_abbr": null, "is_territory": true, "fips": "72", "abbr": "PR", "capital": "San Juan", "capital_tz": "America/Puerto_Rico", "time_zones": ["America/Puerto_Rico"]},
    {"name": "Rhode Island", "name_metaphone": "RHT ISLNT", "statehood_year": 1790, "ap_abbr": "R.I.", "is_territory": false, "fips": "44", "abbr": "RI", "capital": "Providence", "capital_tz": "America/New_York", "time_zones": ["America/New_York"]},
    {"name": "South Carolina", "name_metaphone": "S0 KRLN", "statehood_year": 1788, "ap_abbr": "S.C.", "is_territory": false, "fips": "45", "abbr": "SC", "capital": "Columbia", "capital_tz": "America/New_York", "time_zones": ["America/New_York"]},
    {"name": "South Dakota", "name_metaphone": "S0 TKT", "statehood_year": 1889, "ap_abbr": "S.D.", "is_territory": false, "fips": "46", "abbr": "SD", "capital": "Pierre", "capital_tz": "America/Chicago", "time_zones": ["America/Chicago", "America/Denver"]},
    {"name": "Tennessee", "name_metaphone": "TNS", "statehood_year": 1796, "ap_abbr": "Tenn.", "is_territory": false, "fips": "47", "abbr": "TN", "capital": "Nashville", "capital_tz": "America/Chicago", "time_zones": ["America/Chicago", "America/New_York"]},
    {"name": "Texas", "name_metaphone": "TKSS", "statehood_year": 1845, "ap_abbr": "Texas", "is_territory": false, "fips": "48", "abbr": "TX", "capital": "Austin", "capital_tz": "America/Chicago", "time_zones": ["America/Chicago", "America/Denver"]},
    {"name": "Utah", "name_metaphone": "UT", "statehood_year": 1896, "ap_abbr": "Utah", "is_territory": false, "fips": "49", "abbr": "UT", "capital": "Salt Lake City", "capital_tz": "America/Denver", "time_zones": ["America/Denver"]},
    {"name": "Vermont", "name_metaphone": "FRMNT", "statehood_year": 1791, "ap_abbr": "Vt.", "is_territory": false, "fips": "50", "abbr": "VT", "capital": "Montpelier", "capital_tz": "America/New_York", "time_zones": ["America/New_York"]},
    {"name": "Virgin Islands", "name_metaphone": "FRJN ISLNTS", "statehood_year": null, "ap_abbr": null, "is_territory": true, "fips": "78", "abbr": "VI", "capital": "Charlotte Amalie", "capital_tz": "America/Puerto_Rico", "time_zones": ["America/Puerto_Rico"]},
    {"name": "Virginia", "name_metaphone": "FRJN", "statehood_year": 1788, "ap_abbr": "Va.", "is_territory": false, "fips": "51", "abbr": "VA", "capital": "Richmond", "capital_tz": "America/New_York", "time_zones": ["America/New_York"]},
    {"name": "Washington", "name_metaphone": "WXNKTN", "statehood_year": 1889, "ap_abbr": "Wash.", "is_territory": false, "fips": "53", "abbr": "WA", "capital": "Olympia", "capital_tz": "America/Los_Angeles", "time_zones": ["America/Los_Angeles"]},
    {"name": "West Virginia", "name_metaphone": "WST FRJN", "statehood_year": 1863, "ap_abbr": "W.Va.", "is_territory": false, "fips": "54", "abbr": "WV", "capital": "Charleston", "capital_tz": "America/New_York", "time_zones": ["America/New_York"]},
    {"name": "Wisconsin", "name_metaphone": "WSKNSN", "statehood_year": 1848, "ap_abbr": "Wis.", "is_territory": false, "fips": "55", "abbr": "WI", "capital": "Madison", "capital_tz": "America/Chicago", "time_zones": ["America/Chicago"]},
    {"name": "Wyoming", "name_metaphone": "YMNK", "statehood_year": 1890, "ap_abbr": "Wyo.", "is_territory": false, "fips": "56", "abbr": "WY", "capital": "Cheyenne", "capital_tz": "America/Denver", "time_zones": ["America/Denver"]}
  ];
  load_states();
  
}).call(this);