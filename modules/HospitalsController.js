//////////////////////////////////////////////////////////////////////////
/// loading , creating listView and Calculate Nearest Hospital
/// inherit from baseController
/// singleton class used to create list once DOM is ready
//////////////////////////////////////////////////////////////////////////
define([
  'dojo/_base/declare',
  'modules/BaseController',
  'configs/config',
  'widgets/ListView/listView',
  'dojo/Evented',
  'dojo/dom',
  'esri/tasks/query',
  'dojo/_base/lang',
  'esri/geometry/Point',
  'esri/SpatialReference',
], function (
  declare,
  _BaseController,
  config,
  ListView,
  Evented,
  dom,
  Query,
  lang,
  Point,
  SpatialReference
) {
  var instance = null;
  var dataHospitals = [];
  var centerOfBuffer;

  var hospitalClass = declare([_BaseController, Evented], {
    constructor: function () {},

    //build query from base controller and you can override it
    _buildQuery: function () {
      var output = this.inherited(arguments, [
        config.urls.hospitals,
        ['Name', 'Longitude', 'Latitude'],
        true,
      ]);

      return output;
    },

    //execute query to get data to build list
    executeQueryToLoadData: function () {
      var res = this._buildQuery();
      res.queryTask.execute(
        res.query,
        lang.hitch(this, this._getDataFromQueryResult)
      );
    },

    //get data to create list of hospitals
    _getDataFromQueryResult: function (featureSet) {
      dataHospitals = this.inherited(arguments, [featureSet, true]);
      this.createViewList();
    },

    //get start point from dataSource from parent of action buttons in kendo list
    getPointFromDataSourceOfKendo: function (target, parent, elem, kendoName) {
      centerOfBuffer = this.inherited(arguments);
    },

    //create toolTips in list view
    createKendoTooltip: function (node, filterElem, position, content) {
      this.inherited(arguments);
    },

    // load and create list with it's tooltips  ,click handlers
    createViewList: function () {
      var list = new ListView(dataHospitals);

      list.placeAt(dom.byId('asideList'));

      $('.k-custom-zoom').click(
        lang.hitch(this, function (evt) {
          this.getPointFromDataSourceOfKendo(
            evt.target,
            'div',
            '.listView',
            'kendoListView'
          );
          this.emit('zoom', { point: centerOfBuffer });
        })
      );
      this.createKendoTooltip(list.listViewNode, 'button', 'top', 'Zoom');
    },

    //get nearest hospital in buffer area of the unit
    calculateNearestHospital: function (circleBuffer, hospitalFeatureLayer) {
      var query = new Query();
      query.geometry = circleBuffer.getExtent();

      return hospitalFeatureLayer.queryFeatures(
        query,
        lang.hitch(this, this._selectInBuffer)
      );
    },

    //return hospital point
    _selectInBuffer: function (response) {
      var long = response.features[0].geometry.getLongitude();
      var lat = response.features[0].geometry.getLatitude();

      var hospitalPoint = new Point(
        long,
        lat,
        new SpatialReference({ wkid: 4326 })
      );
      return hospitalPoint;
    },
  });
  hospitalClass.getInstance = function () {
    if (instance === null) {
      instance = new hospitalClass();
    }

    return instance;
  };
  return hospitalClass;
});
