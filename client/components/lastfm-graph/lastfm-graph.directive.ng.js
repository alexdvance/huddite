'use strict'

angular.module('hudditeApp')
.factory('LastfmAPI', ['$resource', '$q', function($resource, $q) {
  const API_KEY = 'cea4e7aab1d913b9baa5584c0cc43375';

  var UserInfo = $resource(
    '//ws.audioscrobbler.com/2.0/?method=user.getinfo&user=:userId&api_key=:apiKey&format=json',
   {userId:'@id', apiKey:'@apiKey'}
  );
  var Charts = $resource(
    '//ws.audioscrobbler.com/2.0/?method=user.getweeklychartlist&user=:userId&api_key=:apiKey&format=json',
   {userId:'@id', apiKey:'@apiKey'}
  );

  var getUserInfo = function(userId, apiKey) {
    return UserInfo.get({ userId: userId, apiKey: API_KEY }).$promise;
  };

  var getWeeklyChartList = function(userId, apiKey) {
    return Charts.get({ userId: userId, apiKey: API_KEY }).$promise;
  };

  return {
    getUserInfo: getUserInfo,
    getWeeklyChartList: getWeeklyChartList,
  };
}])
.directive('lastfmGraph', ['LastfmAPI', function(LastfmAPI) {
  return {
    restrict: 'AE',
    templateUrl: 'client/components/lastfm-graph/lastfm-graph.view.ng.html',
    replace: true,
    link: function($scope) {
      var userId = 'djadvance22';
      LastfmAPI.getUserInfo(userId).then(function(data) {
        console.log('userinfo', data)
        $scope.playCount = data.playcount;
      });
    }
  };
}]);
