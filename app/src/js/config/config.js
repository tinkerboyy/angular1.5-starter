/**
 * Created by Madhukar on 4/18/17.
 */

var coreModule = angular.module('pnc.core');

coreModule.factory('httpInterceptor', httpInterceptor);
coreModule.config(coreConfig);

function httpInterceptor($q) {
  var httpInterceptor = {
    'request': function(config) {
      return config;
    },
    'responseError': function(rejection) {
      var displayText = "";
      if (rejection.status === 404) {
        displayText = "Unable to find url: " + rejection.config.url;
      } else if (rejection.status === 500) {
        displayText = "Internal Server Error";
      } else if (rejection.status === 403) {
        displayText = "Authorization Failed";
      } else if (rejection.status === 400) {
        displayText = "Incorrect values/field validation error";
      }
     // compassToastr.warning(displayText + "<br>Please contact support.");
      console.log(rejection);
      return $q.reject(rejection);
    }
  };
  return httpInterceptor;
}

function coreConfig($httpProvider) {

  $httpProvider.interceptors.push('httpInterceptor');
  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
}
