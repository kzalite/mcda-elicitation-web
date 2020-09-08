'use strict';
define([], function () {
  var dependencies = ['PartialValueFunctionService'];
  var TradeOffDirective = function (PartialValueFunctionService) {
    return {
      restrict: 'E',
      scope: {
        criteria: '=',
        criteriaHavePvf: '=',
        editMode: '=',
        importances: '=',
        isAccessible: '=',
        isSafe: '=',
        problem: '=',
        resetWeights: '=',
        tasks: '=',
        weights: '='
      },
      templateUrl: './tradeOffDirective.html',
      link: function (scope) {
        scope.isPVFDefined = isPVFDefined;

        scope.pvf = PartialValueFunctionService;

        scope.$watch(
          'problem',
          (newProblem) => {
            if (newProblem) {
              scope.elicitationMethod = getElicitationMethod(scope.problem);
            }
          },
          true
        );

        function getElicitationMethod(problem) {
          const preferences = problem.preferences;
          if (_.isEmpty(preferences)) {
            return 'None';
          }
          switch (preferences[0].type) {
            case 'ordinal':
              return 'Ranking';
            case 'exact swing':
              return 'Matching or Precise Swing Weighting';
            case 'ratio bound':
              return 'Imprecise Swing Weighting';
            case 'upper ratio':
              return 'Choice-based Matching';
            default:
              return 'Unknown method';
          }
        }

        function isPVFDefined(dataSource) {
          return dataSource.pvf && dataSource.pvf.type;
        }
      }
    };
  };
  return dependencies.concat(TradeOffDirective);
});
