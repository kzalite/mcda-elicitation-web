'use strict';
define(['lodash', 'angular', 'mcda/controllers/helpers/util', 'mcda/controllers/helpers/wizard'], function(_, angular, Util, Wizard) {
  return function($scope, $state, $stateParams, $injector, currentScenario, taskDefinition, PartialValueFunctionService) {
    var pvf = PartialValueFunctionService;
    $scope.pvf = pvf;

    $scope.title = function(step, total) {
      var base = 'Exact SWING weighting';
      if (step > total) {
        return base + ' (DONE)';
      }
      return base + ' (' + step + '/' + total + ')';
    };

    function buildInitial(criteria, criterionA, criterionB, step) {
      var bounds = pvf.getBounds(criteria[criterionA]);
      var state = {
        step: step,
        total: _.size(criteria) - 1,
        criterionA: criterionA,
        criterionB: criterionB,
        choice: (bounds[0] + bounds[1]) / 2,
        sliderOptions: {
          floor: bounds[0],
          ceil: bounds[1],
          step: Math.abs(bounds[0]-bounds[1])/100,
          precision: 2
        }
      };
      return state;
    }

    var initialize = function(state) {
      var criteria = state.problem.criteria;
      state.prefs = Util.getOrdinalPreferences(state.prefs); // remove pre-existing ordinal/exact preferences
      state = _.extend(state, {
        'criteriaOrder': Util.getCriteriaOrder(state.prefs)
      });
      state = _.extend(state, buildInitial(criteria, state.criteriaOrder[0], state.criteriaOrder[1], 1));
      return state;
    };

    var validChoice = function(state) {
      var criteria = state.problem.criteria;
      if (!state) {
        return false;
      }
      if(state.type === 'done'){
        return true;
      }
      var value = state.choice;
      var bounds = pvf.getBounds(criteria[state.criterionA]);
      return value < bounds[1] && value >= bounds[0];
    };

    var nextState = function(state) {
      var criteria = state.problem.criteria;

      if (!validChoice(state)) {
        return null;
      }
      var order = state.criteriaOrder;

      var idx = _.indexOf(order, state.criterionB);
      var next;
      if (idx > order.length - 2) {
        next = {
          type: 'done',
          step: idx + 1
        };
      } else {
        next = buildInitial(criteria, order[idx], order[idx + 1], idx + 1);
      }

      function getRatio(state) {
        var u = pvf.map(criteria[state.criterionA]);
        return 1 / u(state.choice);
      }

      next.prefs = angular.copy(state.prefs);
      next.prefs.push({
        criteria: [order[idx - 1], order[idx]],
        ratio: getRatio(state),
        type: 'exact swing'
      });

      return _.extend(angular.copy(state), next);
    };

    $scope.canSave = function(state) {
      return state && state.step === state.total + 1;
    };

    $scope.save = function(state) {
      currentScenario.state = _.pick(state, ['problem', 'prefs']);
      currentScenario.$save($stateParams, function(scenario) {
        $scope.$emit('elicit.resultsAccessible', scenario);
        $state.go('preferences');
      });

    };

    $injector.invoke(Wizard, this, {
      $scope: $scope,
      handler: {
        validChoice: validChoice,
        fields: ['prefs', 'total', 'choice', 'criteriaOrder', 'criterionA', 'criterionB'],
        nextState: nextState,
        standardize: _.identity,
        initialize: _.partial(initialize, taskDefinition.clean(currentScenario.state))
      }
    });
  };
});