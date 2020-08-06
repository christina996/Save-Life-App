////////////////////////////////////////////////////////////////////////////////////////
/// singleton class that load and draw route on map based on the start and end points
////////////////////////////////////////////////////////////////////////////////////////
define([
  'dojo/_base/declare',
  'configs/config',
  'esri/tasks/RouteTask',
  'esri/tasks/RouteParameters',
  'esri/tasks/FeatureSet',
  'esri/geometry/Circle',
], function (declare, config, RouteTask, RouteParameters, FeatureSet, Circle) {
  var instance = null;
  var routeParams;
  var routeTask;

  var RouteClass = declare([], {
    constructor: function () {
      this.loadRoute();
    },

    //load route and create query params
    loadRoute: function () {
      routeTask = new RouteTask(config.urls.route);

      routeParams = new RouteParameters();
      routeParams.stops = new FeatureSet();
      routeParams.barriers = new FeatureSet();
      routeParams.returnDirections = true;
      routeParams.outSpatialReference = {
        wkid: 4326,
      };
    },

    //draw route
    drawRoute: function (stop1, stop2, barriers) {
      routeParams.stops.features.push(stop1);
      routeParams.stops.features.push(stop2);
      routeParams.barriers.features = barriers;

      routeTask.solve(routeParams);

      //Events when solve the route or when error occur
      routeTask.on('solve-complete', function (evt) {
        map.graphics.add(
          evt.result.routeResults[0].route.setSymbol(routeSymbol)
        );
      });

      routeTask.on('error', function (err) {
        routeParams.stops.features.length = 0;

        alert(
          'An error occurred\n' +
            err.error.message +
            '\n' +
            err.error.details.join('\n')
        );
      });
    },
  });

  RouteClass.getInstance = function () {
    if (instance === null) {
      instance = new RouteClass();
    }
    return instance;
  };
  return RouteClass;
});
