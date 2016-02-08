var app = angular.module('eocNumbers', ['ui.router', 'ui.bootstrap', 'chart.js']);

app.constant('categories', [
  { param: 'units', text: 'Units' },
  { param: 'buildings', text: 'Buildings' }
]);

app.config(function ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');
  $stateProvider
    .state('categories', {
      url: '/',
      templateUrl: 'partials/categories.html',
      controller: 'categoriesController'
    })
    .state('types', {
      url: '/types/:category',
      templateUrl: 'partials/types.html',
      controller: 'typesController'
    })
    .state('thing', {
      url: '/thing/:category/:id/:graphKey',
      controller: 'thingController',
      templateUrl: 'partials/thing.html'
    })
    .state('brokenList', {
      url: '/brokenList',
      controller: 'brokenListController',
      templateUrl: 'partials/brokenList.html'
    });
});
