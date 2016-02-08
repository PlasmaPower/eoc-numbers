var app = angular.module('eocNumbers');

app.controller('typesController', function ($scope, $stateParams, $http, categories) {
  $scope.category = $stateParams.category;
  for (var i = 0; i < categories.length; i++) {
    var category = categories[i];
    if (category.param === $stateParams.category) {
      $scope.name = category.text;
      break;
    }
  }
  $http.get('./json/' + $stateParams.category + '.json').then(function (response) {
    $scope.things = [];
    $scope.decorations = [];
    response.data.forEach(function (thing, index) {
      thing.index = index;
      var decoration = thing.stats.length === 1 && thing.stats[0].display.hitpoints === 100 && thing.stats[0].xpGain === 0;
      if (decoration) {
        $scope.decorations.push(thing);
      } else {
        $scope.things.push(thing);
      }
    });
  });
});
