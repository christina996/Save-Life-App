//////////////////////////////////////////////////////////////////////////
/// singleton class contain all Utilities Functions of the map
//////////////////////////////////////////////////////////////////////////
define([
  'dojo/_base/declare',
  'esri/layers/FeatureLayer',
  'esri/geometry/Point',
  'esri/dijit/HomeButton',
  'esri/graphic',
  'esri/map',
  'esri/geometry/Circle',
  'modules/RestfulServiceController',
  'dojo/Deferred',
  'dojo/_base/lang',
  'esri/SpatialReference',
  'dojo/Evented',
], function (
  declare,
  FeatureLayer,
  Point,
  HomeButton,
  Graphic,
  Map,
  Circle,
  RestfulServiceController,
  Deferred,
  lang,
  SpatialReference,
  Evented
) {
  var instance = null;
  var circleBuffer;
  var deferred = new Deferred();
  var dataWithinBuffer = [];

  var mapClass = declare([Evented], {
    constructor: function () {},

    //create one instance of the Map in app
    loadMap: function (mapNode, basemap, center, zoomLevel) {
      this.map = new Map(mapNode, {
        basemap: basemap,
        center: center,
        zoom: zoomLevel,
      });
      return this.map;
    },

    //add feature layer on map and return it if you want to use queryFeatures
    addFeatureLayer: function (serviceUrl) {
      var featureLayer = new FeatureLayer(serviceUrl);
      this.map.addLayer(featureLayer);
      return featureLayer;
    },

    //add graphic layer on map and return it if you want to add it to route params
    addGraphic: function (point, symbol) {
      return this.map.graphics.add(new Graphic(point, symbol));
    },

    //zoom to specific point in map
    zoomHandler: function (point, zoomLevel) {
      this.map.centerAndZoom(point, zoomLevel);
    },

    //clear graphics from the map
    clearHandler: function () {
      this.map.graphics.clear();
    },

    //add home button extent to map
    addHomeButton: function (homeNode) {
      var home = new HomeButton(
        {
          map: this.map,
        },
        homeNode
      );
      home.startup();
      return home;
    },

    //create circle buffer from symbol pass to it and draw it in graphic layer and return it to use in any query
    drawCircleBuffer: function (bufferRadius, unit, point, bufferSymbol) {
      circleBuffer = new Circle({
        radius: bufferRadius,
        radiusUnit: unit,
        geodesic: true,
        center: point,
      });

      this.addGraphic(circleBuffer, bufferSymbol);
      return circleBuffer;
    },

    //get data from restful api and return promise
    _getDataFromApi: function (url) {
      var restfulHandler = RestfulServiceController.getInstance();

      restfulHandler.getData(
        url,
        lang.hitch(this, function (response) {
          deferred.resolve(response);
        }),
        lang.hitch(this, function (error) {
          deferred.reject();
        })
      );
      return deferred.promise;
    },

    // to draw any symbols within buffer like barriers and return data within buffer
    drawSymbolsWithinBuffer: function (url, Symbol) {
      this._getDataFromApi(url).then(
        lang.hitch(this, function (data) {
          data.forEach(
            lang.hitch(this, function (res) {
              var point = new Point(
                res.x,
                res.y,
                new SpatialReference({ wkid: 102100 })
              );

              var GeometryPoint = new Point(
                point.getLongitude(),
                point.getLatitude(),
                new SpatialReference({ wkid: 4326 })
              );

              if (circleBuffer.contains(GeometryPoint)) {
                dataWithinBuffer.push(this.addGraphic(GeometryPoint, Symbol));
              }
            })
          );
          this.emit('ready', { dataWithinBuffer: dataWithinBuffer });
        })
      );
    },
  });

  mapClass.getInstance = function () {
    if (instance === null) {
      instance = new mapClass();
    }
    return instance;
  };

  return mapClass;
});
