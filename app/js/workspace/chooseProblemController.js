'use strict';
define(['lodash'], function(_) {
  var dependencies = [
    '$scope',
    '$state',
    '$modal',
    'WorkspaceResource',
    'InProgressResource',
    'PageTitleService'
  ];

  var ChooseProblemController = function(
    $scope,
    $state,
    $modal,
    WorkspaceResource,
    InProgressResource,
    PageTitleService
  ) {
    // functions
    $scope.openChooseProblemModal = openChooseProblemModal;

    // init
    $scope.model = {};
    $scope.local = {};
    $scope.workspacesList = WorkspaceResource.query();
    $scope.inProgressWorkspaces = InProgressResource.query();

    $scope.$watch('local.contents', function(newVal) {
      if (!_.isEmpty(newVal)) {
        $scope.model.choice = 'local';
      }
    });

    PageTitleService.setPageTitle('ChooseProblemController', 'Workspaces');

    function openChooseProblemModal() {
      $modal.open({
        templateUrl: './createWorkspace.html',
        controller: 'CreateWorkspaceController',
        resolve: {
          callback: function() {
            return function(workspaceType, workspace) {
              if (workspaceType === 'manual') {
                $state.go('manualInput');
              } else {
                $state.go('evidence', {
                  workspaceId: workspace.id,
                  problemId: workspace.defaultSubProblemId,
                  id: workspace.defaultScenarioId
                });
              }
            };
          }
        }
      });
    }
  };
  return dependencies.concat(ChooseProblemController);
});
