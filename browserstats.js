var __ = (function() {
  'use strict';
 
  var difference = function() {
    // Return all the items in A that are not in B
    var itemCount = arguments.length;
    var output = {};    

    // Get the list of items in the first list
    var setU = Object.keys(arguments[0]);  // universal set.
    var setB = Object.keys(arguments[1]);

    var diff = [];

    for(var k = 0; k < setU.length; k++) {
      // If we find an item from A in B, remove it.
      var idx = setB.indexOf(setU[k]);
      if(idx === -1) {
        diff.push(setU[k]);
      }
    }
     
    // Only return the final list of items.
    for(var itemIdx = 0; itemIdx < diff.length; itemIdx++) {
      output[diff[itemIdx]] = arguments[0][diff[itemIdx]];
    }

    return output;
  }

  var union = function() {
    // Return all the items in A that are not in B
    var itemCount = arguments.length;
    var output = {};    

    // Get the list of items in the first list
    var setA = Object.keys(arguments[0]);  // universal set.
    var setB = Object.keys(arguments[1]);

    var all = [];

    // Add all of set A to the list.
    for(var k = 0; k < setA.length; k++) {
      all[setA[k]] = arguments[0][setA[k]];
    }

    // Add setB where it is not in SetA
    for(var j = 0; j < setB.length; j++) {
      var idx = setA.indexOf(setB[j]);
      if(idx === -1) {
        all[setB[j]] = arguments[1][setB[j]];
      }
    }
     
    return all;
  }

  var intersection = function() {
    var itemCount = arguments.length;
    var output = {};    

    // Get the list of items in the first list
    var items = Object.keys(arguments[0]).sort();

    // For each array..
    for(var i = 1; i < itemCount; i++) {

      var keys = Object.keys(arguments[i]).sort();
      
      while(items.length > 0 && keys.length > 0) {
        if(items[0] < keys[0]) {
          items.shift();
        }
        else if(items[0] > keys[0]) { 
          keys.shift();
        }
        else if(items[0] === keys[0]) {
          items.shift();
          keys.shift();

          output[items[0]] = arguments[0][items[0]];
        }
      }
    }
     
    return output;
  };

  return {
    union: union,
    difference: difference,
    intersection: intersection
  };
})();

var BrowserStats = function() {
  'use strict';

  var _data = {};
  var _features = {};

  var load = function(type, callback) {
    callback = callback || function() {};
    $.get('data/data.json').success(function(data) { 
      _data = data; 
      parse(type, data, callback); 
    });
  };


  var getFeatures = function() {
    return _features;
  };
 
  var getEras = function(eras) {
    // Everything is an AND
    // Return only features... for now.
    var agentVersions = {};
    var agentsFilter = {};
    var finalFeatures = [];

    // We will only get features that are available in an era.
    // Era 3 = far future
    // Era 0 = NOW.
    
    var numberOfEras = Object.keys(_data.eras).length;

    for(var agent in _data.agents) {
      agentVersions[agent] = [];    
      for(var eraIdx = 0; eraIdx < eras.length; eraIdx++) {
        var version = _data.agents[agent].versions[numberOfEras - (3 - eras[eraIdx]) - 1];
        // Some future browsers don't have a version so we need to assume that a feature
        // in the current version will be kept in.
        if(version !== null) {
          agentVersions[agent].push(version);
        }
      }
    }

    for(var feature in _data.data) {

      // Check to see if the feature is in the stats.
      var stats = _data.data[feature].stats;

      for (var agent in agentVersions) {
        var versions = agentVersions[agent];
        var versionCount = 0;
        for(var version in versions) {
          if(stats[agent][versions[version]] === 'y') {
            finalFeatures[feature] = _data.data[feature];
          }
        }
      }
    }

    return finalFeatures;
  };

  /* 
    The data doesn't come in the format that makes it very queryable.  Lets make it easier
  */
  var parse = function(type, data, callback) {

    for(var featureID in data.data) {
      var feature = data.data[featureID];

      for(var browserID in feature.stats) {
        var browsers = feature.stats[browserID];
        _features[browserID] = _features[browserID] || {};
        for (var version in browsers) {
          if(browsers[version] === 'y') { 
            _features[browserID][version] = _features[browserID][version] || {};
            _features[browserID][version][featureID] = feature;
          }
        }
      }
    }

    callback(data);
  };

  var returnObject = {
    data: _data,
	  load: load,
    getEras: getEras,
    getFeatures: getFeatures
  };

  return returnObject;
};