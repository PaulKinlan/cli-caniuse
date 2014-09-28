var BrowserStats = (function() {
  var Browser = function(key, agent) {
    var _agent = agent;
    var _Share;

    Object.defineProperty(this, "browser", {
      "get": function() {
        return _agent.browser;
      }
    });

    Object.defineProperty(this, "share", {
      "get": function() {
        return _agent.usage_global;
      }
    });

    Object.defineProperty(this, "type", {
      "get": function() {
        return _agent.type;
      }
    });
    
    Object.defineProperty(this, "versionKeys", {
      "get": function() {
        var versions = [];
        for(var v in _agent.versions) {
          if(!!_agent.versions[v]) {
            versions.push(key + "+" + _agent.versions[v]);
          } 

        }
        return versions;
      }
    });

    this.getVersionShare = function(version) {
      return _agent.usage_global[version] || 0;
    }; 

    Object.defineProperty(this, "totalShare", {
      "get": function() {
        if(!!_Share == false) _Share = _.reduce(_agent.usage_global, function(memo, num){ return memo + num }, 0);
        return _Share;
      }
    });
  };

  var Browsers = function () {
    this.browsers_features = {};   
  }; 

  var _data = {};

  var load = function(type, callback) {
    callback = callback || function() {};
    $.get("data/data.json").success(function(data) { _data = data; parse(type, data, callback); });
  };
 
  var browsers = new Browsers();

  var eras = function(eras) {
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
        if(version != null) {
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
          if(stats[agent][versions[version]] == "y") {
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

    var b = new Browsers();

    var browsers_features = b.browsers_features;

    for(var featureID in data.data) {
      var feature = data.data[featureID];

      for(var browserID in feature.stats) {
        var browsers = feature.stats[browserID];
        browsers_features[browserID] = browsers_features[browserID] || {};
        for (var version in browsers) {
          if(browsers[version] == "y") { 
            browsers_features[browserID][version] = browsers_features[browserID][version] || {};
            browsers_features[browserID][version][featureID] = feature;
          }
        }
      }
    }


    callback(b);
  };

  var difference = function() {
    // Return all the items in A that are not in B
    var itemCount = arguments.length;
    var output = {};    

    // Get the list of items in the first list
    var setU = Object.keys(arguments[0]);  // universal set.
    var setB = Object.keys(arguments[1]);

    var diff = []

    for(var k = 0; k < setU.length; k++) {
      // If we find an item from A in B, remove it.
      var idx = setB.indexOf(setU[k]);
      if(idx == -1)
        diff.push(setU[k]);
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
    for(var k = 0; k < setB.length; k++) {
      var idx = setA.indexOf(setB[k]);
      if(idx == -1)
        all[setB[k]] = arguments[1][setB[k]];
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
        if(items[0] < keys[0]) items.shift();
        else if(items[0] > keys[0]) keys.shift();
        else if(items[0] == keys[0]) {
          items.shift();
          keys.shift();

          output[items[0]] = arguments[0][items[0]];
        }
      }
    }
     
    return output;
  };

  var returnObject = {
    data: _data,
	  load: load,
    eras: eras,
    union: union,
    difference: difference,
    intersection: intersection,
	  browsers: function(type) {
	    if(!!type == false) return browsers;
	    else return
	  }
  };

  Object.defineProperty(returnObject, "browsers", {
    "get": function() {
      return browsers;
    }
  });

  return returnObject;
})();