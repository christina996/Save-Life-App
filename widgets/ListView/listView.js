define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dojo/text!./listView.html',
  'dojo/_base/lang',
], function (declare, _WidgetBase, _TemplatedMixin, template, lang) {
  return declare([_WidgetBase, _TemplatedMixin], {
    templateString: template,

    //declare class of list node
    baseClass: 'listView',

    //declare data and commands template if there
    constructor: function (data) {
      this.data = data;
    },

    //create listView based on data and template
    postCreate: function () {
      var dataSource = new kendo.data.DataSource({ data: this.data });
      $(this.listViewNode).kendoListView({
        dataSource,
        template: kendo.template($('#templateListView').html()),
      });
    },
  });
});
