'use strict';
define(['angular'], function () {
  var dependencies = ['$resource'];
  var InProgressResource = function ($resource) {
    return $resource(
      '/api/v2/inProgress/:inProgressId',
      {
        inProgressId: '@inProgressId'
      },
      {
        put: {
          method: 'PUT'
        },
        create: {
          method: 'POST'
        }
      }
    );
  };

  return dependencies.concat(InProgressResource);
});