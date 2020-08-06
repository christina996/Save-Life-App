define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dojo/text!./gridView.html',
], function (declare, _WidgetBase, _TemplatedMixin, template) {
  return declare([_WidgetBase, _TemplatedMixin], {
    templateString: template,

    //declare class of grid node
    baseClass: 'gridView',

    //declare data and commands template if there
    constructor: function (data, commands) {
      this.commands = commands;
      this.data = data;
    },

    //generate columns of the grid dynamic if there 's any commands or any columns
    _generateColumns: function (response) {
      var columns = Object.keys(response[0]).map(function (name) {
        return { field: name };
      });

      this.commands.forEach(function (command) {
        columns.push(command);
      });

      return columns;
    },

    //create gridView based on data and commands
    postCreate: function () {
      var dataSource = new kendo.data.DataSource({ data: this.data });

      $(this.gridViewNode).kendoGrid({
        dataSource,
        columns: this._generateColumns(this.data),
      });
    },
  });
});
