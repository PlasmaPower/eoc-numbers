var app = angular.module('eocNumbers');

app.controller('mainController', function ($scope, categories) {
  $scope.categories = categories;
});
