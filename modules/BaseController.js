//////////////////////////////////////////////////////////////////////////
/// base class used in inheritance for other modules have common methods
/// used in child classes like unit and hospital controllers
//////////////////////////////////////////////////////////////////////////
define([
  'dojo/_base/declare',
  'esri/geometry/webMercatorUtils',
  'esri/tasks/query',
  'esri/tasks/QueryTask',
  'esri/geometry/Point',
], function (declare, webMercatorUtils, Query, QueryTask, Point) {
  return declare('BaseController', [], {
    constructor: function () {},

    //build query and return it before execute if you want to override it
    _buildQuery: function (serviceUrl, arrFields, isGeometry) {
      var queryTask = new QueryTask(serviceUrl);

      var query = new Query();
      query.outFields = arrFields;
      query.returnGeometry = isGeometry;
      query.where = '1=1';
      return { query, queryTask };
    },

    //get data from query and convert it to long and lat if it is x and y
    _getDataFromQueryResult: function (featureSet, isGeometry) {
      var data = [];

      featureSet.features.forEach(function (result, index) {
        if (isGeometry) {
          var arr = webMercatorUtils.xyToLngLat(
            result.geometry.x,
            result.geometry.y
          );

          result.attributes.Longitude = arr[0];
          result.attributes.Latitude = arr[1];
        }

        data.push(result.attributes);
      });

      return data;
    },

    //get point of the selected target from it's parent in kendo
    getPointFromDataSourceOfKendo: function (target, parent, elem, kendoName) {
      var uId = $(target).parents(parent).attr('data-uid');

      var data = $(elem).data(kendoName).dataSource.getByUid(uId);
      return new Point(data.Longitude, data.Latitude);
    },

    //create tooltip in kendo
    createKendoTooltip: function (node, filterElem, position, content) {
      $(node)
        .kendoTooltip({
          filter: filterElem,
          position: position,
          content: content,
        })
        .data('kendoTooltip');
    },
  });
});
