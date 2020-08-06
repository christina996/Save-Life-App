require([
  'modules/UnitsController',
  'modules/HospitalsController',
  'modules/MapController',
  'modules/RouteController',
  'configs/config',
  'esri/symbols/SimpleFillSymbol',
  'esri/symbols/SimpleLineSymbol',
  'esri/Color',
  'esri/symbols/PictureMarkerSymbol',
  'dojo/dom',
  'dojo/on',
  'esri/units',
  'dojo/domReady!',
], function (
  UnitsController,
  HospitalsController,
  MapController,
  RouteController,
  config,
  SimpleFillSymbol,
  SimpleLineSymbol,
  Color,
  PictureMarkerSymbol,
  dom,
  on,
  Units
) {
  //create singleton instance of map controller
  var mapController = MapController.getInstance();

  //create and load map
  var map = mapController.loadMap('map', 'streets', config.mapInfo.center, 10);

  //add and load gif image when there is update on map
  $('#map').append("<img id='loadingImg' src='assets/images/giphy.gif'/>");

  var home = mapController.addHomeButton('HomeButton');

  var clear = $('#clearButton');
  clear.append(
    "<div id='clearBtnImgContainer'><img class='clearImg' src='assets/icons/Clear.png' ></div>"
  );

  var loading = dom.byId('loadingImg');

  on(map, 'update-start', showLoading);
  on(map, 'update-end', hideLoading);

  //show spinner and hide any action buttons act on map until load map
  function showLoading() {
    home.hide();
    clear.hide();

    $('.k-grid-route').addClass('disabledBtn');

    esri.show(loading);
    map.disableMapNavigation();
    map.hideZoomSlider();
  }

  //hide spinner and display any action buttons act on map when map finish it's update
  function hideLoading(error) {
    esri.hide(loading);

    home.show();
    clear.show();

    $('.k-grid-route').removeClass('disabledBtn');

    map.enableMapNavigation();
    map.showZoomSlider();
  }

  //add feature layer for units and hospital
  mapController.addFeatureLayer(config.urls.units);

  //return feature hospital to queryFeature within buffer
  var hospitalFeatureLayer = mapController.addFeatureLayer(
    config.urls.hospitals
  );

  //create singleton instance of unit , hospital and route controller
  var unitInstance = UnitsController.getInstance();
  var hospitalInstance = HospitalsController.getInstance();
  var routeController = RouteController.getInstance();

  //load data in ui in grid and list
  hospitalInstance.executeQueryToLoadData();
  unitInstance.executeQueryToLoadData();

  //define the symbology used to display spots ,buffer, barrier picture and the route
  var greenMarkerSymbol = new PictureMarkerSymbol(
    config.urls.ShapesBaseUrl + 'GreenPin1LargeB.png',
    32,
    32
  ).setOffset(0, 15);

  var redMarkerSymbol = new PictureMarkerSymbol(
    config.urls.ShapesBaseUrl + 'RedPin1LargeB.png',
    32,
    32
  ).setOffset(0, 15);

  var bufferSymbol = new SimpleFillSymbol(
    SimpleFillSymbol.STYLE_SOLID,
    new SimpleLineSymbol(
      SimpleLineSymbol.STYLE_DASHDOT,
      new Color([49, 50, 51]),
      2
    ),
    new Color([255, 255, 255, 0.25])
  );

  var barrierMarkerSymbol = new PictureMarkerSymbol({
    url: 'assets/icons/barrier.png',
    height: 20,
    width: 20,
    type: 'esriPMS',
  });

  //declare start , end points and buffer
  var spot1;
  var spot2;
  var buffer;
  //const
  var ZOOM_LEVEL = 11;

  //handel zoom event
  hospitalInstance.on('zoom', function (e) {
    mapController.zoomHandler(e.point, ZOOM_LEVEL);
  });

  unitInstance.on('zoom', function (e) {
    mapController.zoomHandler(e.point, ZOOM_LEVEL);
  });

  //handel route event
  unitInstance.on('route', function (e) {
    spot1 = e.point;

    //clear and zoom to unit
    mapController.clearHandler();
    mapController.zoomHandler(spot1, ZOOM_LEVEL);

    //draw buffer around unit
    buffer = mapController.drawCircleBuffer(
      config.mapInfo.buffer,
      Units.METER,
      spot1,
      bufferSymbol
    );

    //get nearest point of hospital
    var nearestHospital = hospitalInstance.calculateNearestHospital(
      buffer,
      hospitalFeatureLayer
    );

    nearestHospital.then(function (res) {
      spot2 = res.features[0].geometry;

      //add 2 spots in map
      mapController.addGraphic(spot1, redMarkerSymbol);
      mapController.addGraphic(spot2, greenMarkerSymbol);

      //draw symbols that appear within buffer
      mapController.drawSymbolsWithinBuffer(
        config.urls.barriers,
        barrierMarkerSymbol
      );

      //when barriers and 2 spots ready draw al route
      mapController.on('ready', function (res) {
        routeController.drawRoute(spot1, spot2, res.dataWithinBuffer);
      });
    });
  });

  //add click handler to clear btn to clear all graphics
  $('#clearButton').click(function (e) {
    mapController.clearHandler();
  });

  //create kendo toolbar
  var isOpen = false;

  $('#toolbar').kendoToolBar({
    items: [
      {
        type: 'button',
        imageUrl: 'assets/icons/hosp.png',
        attributes: { class: 'k-flat' },
        click: function (e) {
          if (!isOpen) {
            $('#asideList').css('width', '25%');
            $('#main').css('width', '75%');

            isOpen = true;
          } else {
            $('#asideList').css('width', '0%');
            $('#main').css('width', '100%');

            isOpen = false;
          }
        },
      },
      { type: 'separator' },
      { template: "<h3 style='margin-left: 20px;'>Save Life</h3>" },
    ],
  });
});
