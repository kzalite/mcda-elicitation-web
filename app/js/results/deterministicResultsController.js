'use strict';
define(['clipboard', 'lodash'], function(Clipboard, _) {
  var dependencies = [
    '$scope',
    '$stateParams',
    'currentScenario',
    'taskDefinition',
    'MCDAResultsService',
    'EffectsTableService',
    'OrderingService',
    'PageTitleService',
    'WorkspaceSettingsService'
  ];

  var DeterministicResultsController = function(
    $scope,
    $stateParams,
    currentScenario,
    taskDefinition,
    MCDAResultsService,
    EffectsTableService,
    OrderingService,
    PageTitleService,
    WorkspaceSettingsService
  ) {
    // functions
    $scope.sensitivityScalesChanged = sensitivityScalesChanged;
    $scope.recalculateResults = recalculateResults;
    $scope.resetSensitivityAnalysis = resetSensitivityAnalysis;
    $scope.doMeasurementSensitivity = doMeasurementSensitivity;
    $scope.doPreferencesSensitivity = doPreferencesSensitivity;
    $scope.isEditing = isEditing;
    $scope.loadState = loadState;
    $scope.getWorkspaceSettings = getWorkspaceSettings;

    // init
    $scope.scenario = currentScenario;
    $scope.scales = $scope.workspace.scales;
    $scope.sensitivityMeasurements = {
      alteredTableCells: [],
      isEditing: false
    };
    OrderingService.getOrderedCriteriaAndAlternatives($scope.aggregateState.problem, $stateParams).then(function(ordering) {
      $scope.criteria = ordering.criteria;
      $scope.tableRows = EffectsTableService.buildEffectsTable(ordering.criteria);
      $scope.alternatives = ordering.alternatives;
      $scope.nrAlternatives = _.keys($scope.alternatives).length;
      loadState();
      $scope.$watch('scales.observed', function() {
        resetSensitivityAnalysis();
      });
    });
    
    getWorkspaceSettings();

    new Clipboard('.clipboard-button');
    PageTitleService.setPageTitle('DeterministicResultsController', ($scope.aggregateState.problem.title || $scope.workspace.title) +'\'s deterministic results');

    //public 
    function isEditing(value) {
      $scope.sensitivityMeasurements.isEditing = value;
    }

    function resetSensitivityAnalysis() {
      $scope.modifiableScales = MCDAResultsService.resetModifiableScales(
        $scope.scales.observed, _.keyBy($scope.alternatives, 'id'));
      delete $scope.recalculatedDeterministicResults;
      $scope.sensitivityMeasurements.alteredTableCells = [];
    }

    function sensitivityScalesChanged(newValue, row, alternative) {
      $scope.modifiableScales[row.dataSource.id][alternative.id]['50%'] = newValue;
      $scope.sensitivityMeasurements.alteredTableCells.push({
        criterion: row.criterion.id,
        alternative: alternative.id,
        value: newValue
      });
    }

    function recalculateResults() {
      delete $scope.recalculatedDeterministicResults;
      $scope.recalculatedDeterministicResults = MCDAResultsService.getRecalculatedDeterministicResulsts($scope, $scope.state);
    }

    function initialize(state) {
      $scope.sensitivityMeasurements.measurementsAlternative = $scope.alternatives[0];
      $scope.sensitivityMeasurements.measurementsCriterion = $scope.criteria[0];
      $scope.sensitivityMeasurements.preferencesCriterion = $scope.criteria[0];

      $scope.deterministicResults = MCDAResultsService.getDeterministicResults($scope, state);
      var overallResults = MCDAResultsService.getResults($scope, state);
      doMeasurementSensitivity(state);
      doPreferencesSensitivity(state);
      return overallResults;
    }

    function doMeasurementSensitivity(state) {
      delete $scope.measurementValues;
      MCDAResultsService.getMeasurementsSensitivityResults($scope, state).resultsPromise.then(function(result) {
        $scope.measurementValues = MCDAResultsService.pataviResultToLineValues(result.results, $scope.alternatives, $scope.scenario.state.legend);
      });
    }

    function doPreferencesSensitivity(state) {
      delete $scope.preferencesValues;
      MCDAResultsService.getPreferencesSensitivityResults($scope, state).resultsPromise.then(function(result) {
        $scope.preferencesValues = MCDAResultsService.pataviResultToLineValues(result.results, $scope.alternatives, $scope.scenario.state.legend);
      });
    }

    function loadState() {
      $scope.aggregateState = MCDAResultsService.replaceAlternativeNames($scope.scenario.state.legend, $scope.aggregateState);
      $scope.state = initialize(taskDefinition.clean($scope.aggregateState));
    }        
    function getWorkspaceSettings() {
      $scope.toggledColumns = WorkspaceSettingsService.getToggledColumns();
      $scope.workspaceSettings = WorkspaceSettingsService.getWorkspaceSettings();
    }
  };
  return dependencies.concat(DeterministicResultsController);
});
