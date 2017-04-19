/**
 * Created by Madhukar on 4/18/17.
 */

angular
  .module('pnc')
  .config(function($stateProvider, $urlRouterProvider) {
      $stateProvider
          .state('app', {
            abstract: true,
            templateUrl: 'layout/shell.html'
          })
          .state('app.home', {
            url: '/',
            controller: 'MarketingController',
            controllerAs: 'home',
            templateUrl: 'pages/marketing/marketing.html',
            title: 'Home'
          });

      $urlRouterProvider.otherwise('/');
    }
);