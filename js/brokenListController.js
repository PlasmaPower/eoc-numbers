var app = angular.module('eocNumbers');

app.controller('brokenListController', function ($scope, $http, categories) {
  $scope.brokenItems = {};
  $scope.loaded = {};
  for (var y = 0; y < categories.length; y++) {
    (function (category) {
      $http.get('./json/' + category.param + '.json').then(function (response) {
        $scope.loaded[category.param] = true;
        var data = response.data;
        var brokenItems = $scope.brokenItems[category] = [];
        for (var x = 0; x < data.length; x++) {
          var item = data[x];
          var stats = item.stats;
          var lastVals = {};
          var direction = {};
          var firstRow = stats[0];
          var lastRow = stats[stats.length - 1];
          var keys = Object.keys(stats[0]);
          for (var n = 0; n < keys.length; n++) {
            var key = keys[n];
            var start = firstRow[key];
            var end = lastRow[key];
            if (key === 'display') {
              var displayKeys = Object.keys(start);
              for (var i = 0; i < displayKeys.length; i++) {
                var displayKey = displayKeys[i];
                direction[displayKey] = Math.sign(end[displayKey] - start[displayKey]);
              }
            } else if (key.toLowerCase().endsWith('cost')) {
              var resources = [];
              [start, end].forEach(function (costs) {
                costs.forEach(function (cost) {
                  if (resources.indexOf(cost.resource) === -1) {
                    resources.push(cost.resource);
                  }
                });
              });
              function fromName(costs, name) {
                return costs.filter(function (cost) {
                  return cost.resource === name;
                }).reduce(function (prev, curr) {
                  return prev + curr.amount;
                }, 0);
              }
              for (var i = 0; i < resources.length; i++) {
                var resource = resources[i];
                direction[resource + ' ' + key] = Math.sign((fromName(end, resource) || 0) - (fromName(start, resource) || 0));
              }
            } else {
              if (start instanceof Object) {
                continue;
              }
              direction[key] = Math.sign(end - start);
            }
          }
          for (var i = 0; i < stats.length; i++) {
            function handlePoint(key, point, prefix) {
              if (prefix) {
                prefix = prefix + ' ';
              } else {
                prefix = '';
              }
              if (lastVals[prefix + key]
                  && point !== lastVals[prefix + key]
                  && Math.sign(point - lastVals[prefix + key]) !== direction[prefix + key]) {
                $scope.brokenItems[category.param] = $scope.brokenItems[category.param] || [];
                $scope.brokenItems[category.param].push({
                  name: item.name,
                  id: x,
                  graphKey: key,
                  keyName: prefix + (item.statsTitles[key] || key),
                  direction: point > lastVals[prefix + key] ? 'increases' : 'decreases',
                  level: i + 1
                });
              }
              lastVals[prefix + key] = point;
            }
            function parseRow(row) {
              var keys = Object.keys(row);
              for (var n = 0; n < keys.length; n++) {
                var key = keys[n]
                var point = row[key];
                if (key === 'display') {
                  parseRow(point);
                  continue;
                } else if (key.toLowerCase().endsWith('cost')) {
                  for (var r = 0; r < point.length; r++) {
                    var cost = point[r];
                    handlePoint(key, cost.amount, cost.resource);
                  }
                } else if (!(point instanceof Object)) {
                  handlePoint(key, point);
                }
              }
            }
            parseRow(stats[i]);
          }
        }
      });
    })(categories[y]);
  }
});
