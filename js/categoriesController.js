var app = angular.module('eocNumbers');

app.controller('categoriesController', function ($scope, categories) {
  $scope.categories = categories;
});
