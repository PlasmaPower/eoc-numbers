var app = angular.module('eocNumbers');

Chart.defaults.Line.scaleBeginAtZero = true;
Chart.defaults.Line.bezierCurve = false;
Chart.defaults.Line.animation = false;

app.controller('thingController', function ($scope, $state, $stateParams, $http, categories) {
  window.state = $state;
  $scope.category = $stateParams.category;
  $scope.setGraph = function (key) {
    $state.go('thing', { graphKey: key }, { notify: false });
    $scope.graph = key;
  };
  $scope.getTypesFor = function (key) {
    var types = [];
    var table = $scope.table;
    for (var i = 0; i < table.length; i++) {
      var cost = table[i][key].cost;
      for (var n = 0; n < cost.length; n++) {
        var resource = cost[n].resource;
        if (types.indexOf(resource) === -1) {
          types.push(resource);
        }
      }
    }
    return types;
  };
  $scope.dataCache = {};
  $scope.dataFor = function (key) {
    if ($scope.dataCache[key]) {
      return $scope.dataCache[key];
    }
    var table = $scope.table;
    var samplePoint = table[0][key];
    if (samplePoint.type === 'number' || samplePoint.type === 'time') {
      var data = [];
      for (var i = 0; i < table.length; i++) {
        var point = table[i][key];
        data.push(point.number);
      }
      return $scope.dataCache[key] = [data];
    } else if (samplePoint.type === 'cost') {
      var types = $scope.getTypesFor(key);
      var data = [];
      for (var i = 0; i < types.length; i++) {
        data.push([]);
      }
      for (var i = 0; i < table.length; i++) {
        var cost = table[i][key].cost;
        var costObj = {};
        for (var n = 0; n < cost.length; n++) {
          var curr = cost[n];
          costObj[curr.resource] = curr.amount;
        }
        for (var n = 0; n < types.length; n++) {
          data[n].push(costObj[types[n]] || 0);
        }
      }
      return $scope.dataCache[key] = data;
    }
  };
  $scope.labelsCache = {};
  $scope.labelsFor = function (key) {
    if ($scope.labelsCache[key]) {
      return $scope.labelsCache[key];
    }
    var labels = [];
    var table = $scope.table;
    for (var i = 0; i < table.length; i++) {
      if (i === 0) {
        labels.push('Level ' + (i + 1));
      } else {
        labels.push(i + 1);
      }
    }
    return $scope.labelsCache[key] = labels;
  };
  $scope.seriesCache = {};
  $scope.seriesFor = function (key) {
    if ($scope.seriesCache[key]) {
      return $scope.seriesCache[key];
    }
    var thing = $scope.thing;
    var table = $scope.table;
    var name = thing.statsTitles[key] || key;
    var samplePoint = table[0][key];
    if (samplePoint.type === 'number') {
      return $scope.seriesCache[key] = [name];
    } else if (samplePoint.type === 'time') {
      return $scope.seriesCache[key] = [name + ' (seconds)'];
    } else if (samplePoint.type === 'cost') {
      return $scope.seriesCache[key] = $scope.getTypesFor(key).map(function (type) {
        return type + ' ' + name;
      });
    }
  };
  $scope.colorsCache = {};
  $scope.colorsFor = function(key) {
    if ($scope.colorsCache[key]) {
      return $scope.colorsCache[key];
    }
    var resourceColors = {
      'crystalite': '#B41898',
      'adamantite': '#EF7F1A',
      'energon': '#C22B2B'
    };
    var table = $scope.table;
    var samplePoint = table[0][key];
    if (samplePoint.type === 'cost') {
      var types = [];
      for (var i = 0; i < table.length; i++) {
        var cost = table[i][key].cost;
        for (var n = 0; n < cost.length; n++) {
          var resource = cost[n].resource;
          if (types.indexOf(resource) === -1) {
            types.push(resource);
          }
        }
      }
      var colors = types.map(function (type) {
        return resourceColors[type];
      });
      return $scope.colorsCache[key] = colors;
    } else {
      var resources = Object.keys(resourceColors);
      for (var i = 0; i < resources.length; i++) {
        var resource = resources[i];
        if (key.toLowerCase().indexOf(resource) !== -1) {
          return $scope.colorsCache[key] = [resourceColors[resource]];
        }
      }
      return $scope.colorsCache[key] = Chart.defaults.global.colours;
    }
  };
  for (var i = 0; i < categories.length; i++) {
    var category = categories[i];
    if (category.param === $stateParams.category) {
      $scope.categoryName = category.text;
      break;
    }
  }
  function parseTime(time) {
    if (time === 0) return '0';
    var ret = [];
    var units = {
      'd': 24*60*60,
      'h': 60*60,
      'm': 60,
      's': 1
    };
    var unitKeys = Object.keys(units);
    for (var i = 0; i < unitKeys.length; i++) {
      var unit = unitKeys[i];
      var unitTime = units[unit];
      var number = Math.floor(time / unitTime);
      time = time % unitTime;
      if (number !== 0) {
        ret.push(number + unit);
      }
    }
    return ret.join(' ');
  }
  $http.get('./json/' + $stateParams.category + '.json').then(function (response) {
    var thing = response.data[$stateParams.id]
    $scope.thing = thing;
    var stats = thing.stats;
    $scope.graph = $stateParams.graphKey;
    $scope.table = [];
    var uselessRequiredPlayerLevel = true;
    var uselessXpGain = true;
    for (var i = 0; i < stats.length; i++) {
      if (stats[i].requiredPlayerLevel > 1) {
        uselessRequiredPlayerLevel = false;
      }
      if (stats[i].xpGain !== 0) {
        uselessXpGain = false;
      }
      if (!uselessRequiredPlayerLevel && !uselessXpGain) {
        break;
      }
    }
    for (var i = 0; i < stats.length; i++) {
      var currStats = stats[i];
      var row = {};
      $scope.table.push(row);
      function parseObj(obj) {
        var keys = Object.keys(obj);
        for (var n = 0; n < keys.length; n++) {
          var key = keys[n];
          var val = obj[key];
          if (key === 'requiredPlayerLevel' && uselessRequiredPlayerLevel) {
            continue;
          } else if (key === 'xpGain' && uselessRequiredPlayerLevel) {
            continue;
          } else if (typeof val === 'number') {
            if (key.toLowerCase().endsWith('time')) {
              row[key] = {
                type: 'time',
                text: parseTime(val),
                number: val
              };
            } else {
              row[key] = {
                type: 'number',
                number: val
              };
            }
          } else if (key === 'display') {
            parseObj(val);
          } else if (key.toLowerCase().endsWith('cost')) {
            row[key] = {
              type: 'cost',
              text: val.map(function (cost) {
                return cost.resource + ': ' + cost.amount;
              }).join('\n'),
              cost: val
            };
          }
        }
      }
      parseObj(currStats);
    }
    $scope.keys = Object.keys($scope.table[0]);
  });
});
