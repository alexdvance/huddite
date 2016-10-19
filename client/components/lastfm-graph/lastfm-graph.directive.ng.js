'use strict'

angular.module('hudditeApp')
.factory('LastfmAPIService', ['$resource', '$q', function($resource, $q) {
  // Define CreditCard class
  var Charts = $resource('//ws.audioscrobbler.com/2.0/?method=user.getweeklychartlist&user=:userId&api_key=:apiKey&format=json',
   {userId:'@id', apiKey:'@apiKey'}
  );

  var getWeeklyChartList = function(userId, apiKey) {
    // We can retrieve a collection from the server
    var stats = Charts.get({userId:userId, apiKey:apiKey}, function() {
      console.log(stats);
    });
  };

  return {
    getWeeklyChartList: getWeeklyChartList
  };
}])
.directive('lastfmGraph', ['LastfmAPIService', function(LastfmAPIService) {
  return {
    restrict: 'AE',
    templateUrl: 'client/components/lastfm-graph/lastfm-graph.view.ng.html',
    replace: true,
    link: function() {
      var userId = 'djadvance22';
      var API_KEY = 'cea4e7aab1d913b9baa5584c0cc43375';
      LastfmAPIService.getWeeklyChartList(userId, API_KEY);
    }
  };
}]);
