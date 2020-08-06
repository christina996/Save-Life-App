define({
  urls: {
    units:
      'http://services5.arcgis.com/2j6RLW7Jge6dxQ4l/ArcGIS/rest/services/mgds_training_units/FeatureServer/0',
    hospitals:
      'http://services5.arcgis.com/2j6RLW7Jge6dxQ4l/ArcGIS/rest/services/mgds_training_hospitals/FeatureServer/0',
    barriers: 'http://192.168.9.142/FE_Service/api/barrier',
    route:
      'http://204.11.33.8:6080/arcgis/rest/services/GSS/Routing_ServiceArea/NAServer/Route',
    ShapesBaseUrl: 'https://static.arcgis.com/images/Symbols/Shapes/',
  },
  mapInfo: {
    buffer: 10000,
    center: [-118.243683, 34.052235],
  },
});
