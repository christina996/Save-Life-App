//////////////////////////////////////////////////////////////////////////
/// singleton class to handle ajax request GET
//////////////////////////////////////////////////////////////////////////
define(['dojo/_base/declare', 'dojo/request'], function (declare, request) {
  var instance = null;

  var restfulClass = declare([], {
    //get data from restful api
    getData: function (url, onSuccess, onFailure) {
      request
        .get(url, {
          preventCache: true,
          headers: { 'X-Requested-With': null },
          handleAs: 'json',
        })
        .then(
          function (response) {
            if (onSuccess && typeof onSuccess == 'function') {
              onSuccess(response);
            }
          },
          function (error) {
            if (onFailure && typeof onFailure == 'function') {
              onFailure(error);
            }
          }
        );
    },
  });

  restfulClass.getInstance = function () {
    if (instance === null) {
      instance = new restfulClass();
    }
    return instance;
  };
  return restfulClass;
});
