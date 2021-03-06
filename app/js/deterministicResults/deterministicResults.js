'use strict';
define([
  './deterministicResultsController',

  './deterministicWeightsTableDirective',
  './lineChartDirective',
  './measurementSensitivityDirective',
  './preferencesSensitivityDirective',
  './sensitivityInputDirective',
  './sensitivityTableDirective',
  './valueProfileTableDirective',
  './valueProfilePlotDirective',
  './valueProfilesDirective',

  './deterministicResultsService',

  'angular',
  'angular-patavi-client'
], function(
  DeterministicResultsController,

  deterministicWeightsTableDirective,
  lineChartDirective,
  measurementSensitivityDirective,
  preferencesSensitivityDirective,
  sensitivityInputDirective,
  sensitivityTableDirective,
  valueProfileTableDirective,
  valueProfilePlotDirective,
  valueProfilesDirective,

  DeterministicResultsService,

  angular
) {
  return angular.module('elicit.deterministicResults', ['patavi', 'elicit.results'])
    .controller('DeterministicResultsController', DeterministicResultsController)

    .directive('deterministicWeightsTable', deterministicWeightsTableDirective)
    .directive('lineChart', lineChartDirective)
    .directive('measurementSensitivity', measurementSensitivityDirective)
    .directive('preferencesSensitivity', preferencesSensitivityDirective)
    .directive('sensitivityInput', sensitivityInputDirective)
    .directive('sensitivityTable', sensitivityTableDirective)
    .directive('valueProfileTable', valueProfileTableDirective)
    .directive('valueProfilePlot', valueProfilePlotDirective)
    .directive('valueProfiles', valueProfilesDirective)

    .factory('DeterministicResultsService', DeterministicResultsService)
    ;
});
