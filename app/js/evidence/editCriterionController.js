'use strict';
define(['lodash'], function(_) {
  var dependencies = ['$scope', '$modalInstance', 'criterion', 'criterionId', 'criteria', 'valueTree', 'callback'];
  var EditCriterionController = function($scope, $modalInstance, criterion, criterionId, criteria, valueTree, callback) {
    // functions
    $scope.cancel = cancel;
    $scope.save = save;
    $scope.checkForDuplicateNames = checkForDuplicateNames;
    $scope.checkUrl = checkUrl;

    // init
    $scope.originalTitle = criterion.title;
    $scope.criterion = _.cloneDeep(criterion);
    $scope.isTitleUnique = true;
    $scope.isValidUrl = true;
    $scope.criteria = criteria;
    $scope.valueTree = valueTree;
    if ($scope.valueTree.children) {
      $scope.favorabilityStatus = {};
      $scope.favorabilityStatus.originalFavorability = !!_.find($scope.valueTree.children[0].criteria, function(crit) {
        return crit === criterionId;
      });
      $scope.favorabilityStatus.isFavorable = _.cloneDeep($scope.favorabilityStatus.originalFavorability);
    }

    function save() {
      var favorabilityChanged = $scope.valueTree.children ? $scope.favorabilityStatus.originalFavorability !== $scope.favorabilityStatus.isFavorable : false;
      callback($scope.criterion, favorabilityChanged);
      $modalInstance.close();
    }

    function cancel() {
      $modalInstance.close();
    }


    function checkForDuplicateNames() {
      if (_.find($scope.criteria, function(criterion) {
          return criterion === $scope.criterion.title;
        }) && $scope.originalTitle !== $scope.criterion.title) {
        $scope.isTitleUnique = false;
      } else {
        $scope.isTitleUnique = true;
      }
    }

    function checkUrl() {
      var regex = new RegExp(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi);
      if ($scope.criterion.sourceLink && !$scope.criterion.sourceLink.match(regex)) {
        $scope.isValidUrl = false;
      } else {
        $scope.isValidUrl = true;
      }
    }
  };
  return dependencies.concat(EditCriterionController);
});