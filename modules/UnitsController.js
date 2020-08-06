//////////////////////////////////////////////////////////////////////////
/// loading and creating grid
/// inherit from baseController
/// singleton class used to create grid once DOM is ready
//////////////////////////////////////////////////////////////////////////
define([
  'dojo/_base/declare',
  'modules/BaseController',
  'configs/config',
  'widgets/GridView/gridView',
  'dojo/Evented',
  'dojo/_base/lang',
  'dojo/dom',
], function (declare, _BaseController, config, GridView, Evented, lang, dom) {
  var instance = null;
  var dataUnits = [];

  var unitClass = declare([_BaseController, Evented], {
    constructor: function () {
      this.createKendoTooltip('#toolbar', 'a', 'bottom', 'Hospitals');
      this.createKendoTooltip('#clearButton', 'div', 'top', 'Clear Map');
    },

    //build query from base controller and you can override it
    _buildQuery: function () {
      var output = this.inherited(arguments, [
        config.urls.units,
        ['Name', 'Type', 'Longitude', 'Latitude'],
        true,
      ]);

      return output;
    },

    //execute query to get data to build grid
    executeQueryToLoadData: function () {
      var res = this._buildQuery();
      res.queryTask.execute(
        res.query,
        lang.hitch(this, this._getDataFromQueryResult)
      );
    },

    //get data to create grid
    _getDataFromQueryResult: function (featureSet) {
      dataUnits = this.inherited(arguments, [featureSet, false]);
      this.createGridView();
    },

    //get start point from dataSource from parent of action buttons in kendo Grid
    getPointFromDataSourceOfKendo: function (target, parent, elem, kendoName) {
      centerOfBuffer = this.inherited(arguments);
    },

    //create toolTips in grid view
    createKendoTooltip: function (node, filterElem, position, content) {
      this.inherited(arguments);
    },

    // load and create grid with it's tooltips , commands ,click handlers
    createGridView: function () {
      var commands = [
        {
          command: {
            name: 'zoom',
            template: kendo.template($('#templateZoomBtn').html()),
            click: lang.hitch(this, function (e) {
              this.getPointFromDataSourceOfKendo(
                e.target,
                'tr',
                '.gridView',
                'kendoGrid'
              );
              this.emit('zoom', { point: centerOfBuffer });
            }),
          },
        },
        {
          command: {
            name: 'route',
            template: kendo.template($('#templateRouteBtn').html()),
            click: lang.hitch(this, function (e) {
              this.getPointFromDataSourceOfKendo(
                e.target,
                'tr',
                '.gridView',
                'kendoGrid'
              );
              this.emit('route', { point: centerOfBuffer });
            }),
          },
        },
      ];

      var grid = new GridView(dataUnits, commands);
      grid.placeAt(dom.byId('main'));

      this.createKendoTooltip(
        grid.gridViewNode,
        '.k-grid-custom-zoom',
        'top',
        'Zoom'
      );

      this.createKendoTooltip(
        grid.gridViewNode,
        '.k-grid-custom-route',
        'top',
        'Route To Nearest Hospital'
      );
    },
  });

  unitClass.getInstance = function () {
    if (instance === null) {
      instance = new unitClass();
    }

    return instance;
  };
  return unitClass;
});
