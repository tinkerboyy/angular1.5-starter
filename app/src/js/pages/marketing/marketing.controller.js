/**
 * Created by Madhukar on 4/18/17.
 */
function MarketingController() {
  this.$onInit = function() {
    console.log('Marketing controller');
  }
}

angular
    .module('pnc.marketing')
    .controller('MarketingController', MarketingController)