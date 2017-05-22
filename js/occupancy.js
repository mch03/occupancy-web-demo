/**
 * Copyright reelyActive 2017
 * We believe in an open Internet of Things
 */

angular.module('occupancy', [ 'ui.bootstrap', 'reelyactive.beaver' ])

  /**
   * OccupancyCtrl Controller
   * Handles the manipulation of all variables accessed by the HTML view.
   */
  .controller('OccupancyCtrl', function($scope, $interval, beaver) {

    $scope.url = 'https://pareto.reelyactive.com';
    $scope.connectionMessage = 'First connect to a websocket data stream';
    $scope.displayConnection = true;
    $scope.rssiThreshold = 160;
    $scope.connected = false;
    $scope.occupants = [];

    var socket;

    // Update the filters
    $scope.updateFilters = function(rssi) {
      $scope.rssiThreshold = rssi;
    };

    // Connect to a websocket with the given url and optional token
    $scope.connect = function(url, token) {
      var options = {};
      if(token && (typeof(token) === 'string')) {
        options.query = { token: token };
      }
      socket = io.connect(url, options);
      beaver.listen(socket);
      socket.on('connect', function() {
        $scope.connectionMessage = 'Connected to ' + url;
        $scope.displayConnection = false;
        $scope.connected = true;
        $scope.$apply();
        $interval(updateOccupants, 1000);
      });
    };

    // Update the array of occupants
    function updateOccupants() {
      var occupants = [];
      var devices = beaver.getDevices();
      for(id in devices) {
        var device = devices[id].event;
        if(device.rssi > $scope.rssiThreshold) {
          occupants.push(device);
        }
      }
      $scope.occupants = occupants;
    }

  });
