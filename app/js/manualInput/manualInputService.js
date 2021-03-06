'use strict';
define(['lodash', 'angular'], function(_, angular) {
  var dependencies = [
    'InputKnowledgeService',
    'generateUuid',
    'currentSchemaVersion',
    'significantDigits'
  ];
  var ManualInputService = function(
    InputKnowledgeService,
    generateUuid,
    currentSchemaVersion,
    significantDigits
  ) {
    function createProblem(criteria, alternatives, title, description, inputData, useFavorability) {
      var newCriteria = buildCriteria(criteria, useFavorability);
      return {
        schemaVersion: currentSchemaVersion,
        title: title,
        description: description,
        criteria: newCriteria,
        alternatives: buildAlternatives(alternatives),
        performanceTable: buildPerformanceTable(inputData, newCriteria, alternatives)
      };
    }

    function prepareInputData(criteria, alternatives, oldInputData) {
      var dataSources = getDataSources(criteria);
      if (oldInputData) {
        return {
          effect: createInputTableRows(dataSources, alternatives, oldInputData.effect),
          distribution: createInputTableRows(dataSources, alternatives, oldInputData.distribution)
        };
      } else {
        return {
          effect: createInputTableRows(dataSources, alternatives),
          distribution: createInputTableRows(dataSources, alternatives)
        };
      }
    }

    function createInputTableRows(dataSources, alternatives, oldInputData) {
      return _.reduce(dataSources, function(accum, dataSource) {
        accum[dataSource.id] = createInputTableCells(dataSource, alternatives, oldInputData);
        return accum;
      }, {});
    }

    function createInputTableCells(dataSource, alternatives, oldInputData) {
      return _.reduce(alternatives, function(accum, alternative) {
        if (hasOldInputDataAvailable(oldInputData, dataSource.id, alternative.id)) {
          accum[alternative.id] = oldInputData[dataSource.id][alternative.id];
        } else {
          accum[alternative.id] = {
            inputParameters: {
              id: 'value'
            }
          };
        }
        accum[alternative.id].isInvalid = true;
        return accum;
      }, {});
    }

    function hasOldInputDataAvailable(oldData, dataSourceId, alternativeId) {
      return oldData && oldData[dataSourceId] && oldData[dataSourceId][alternativeId];
    }

    function getDataSources(criteria) {
      return _.reduce(criteria, function(accum, criterion) {
        return accum.concat(criterion.dataSources);
      }, []);
    }

    function createStateFromOldWorkspace(oldWorkspace) {
      var state = {
        oldWorkspace: oldWorkspace,
        useFavorability: hasFavorableCriterion(oldWorkspace),
        step: 'step1',
        isInputDataValid: false,
        description: oldWorkspace.problem.description,
        criteria: copyOldWorkspaceCriteria(oldWorkspace),
        alternatives: copyOldWorkspaceAlternatives(oldWorkspace)
      };
      state.inputData = createInputFromOldWorkspace(state.criteria,
        state.alternatives, oldWorkspace);
      return state;
    }

    function hasFavorableCriterion(workspace) {
      return _.some(workspace.problem.criteria, function(criterion) {
        return criterion.hasOwnProperty('isFavorable');
      });
    }

    function copyOldWorkspaceAlternatives(oldWorkspace) {
      return _.map(oldWorkspace.problem.alternatives, function(alternative, alternativeId) {
        return _.extend({}, alternative, {
          id: generateUuid(),
          oldId: alternativeId
        });
      });
    }

    function buildCriteria(criteria, useFavorability) {
      var newCriteria = _.map(criteria, function(criterion) {
        var newCriterion = _.pick(criterion, [
          'title',
          'description'
        ]);
        if (useFavorability) {
          newCriterion.isFavorable = criterion.isFavorable;
        }
        newCriterion.dataSources = _.map(criterion.dataSources, buildDataSource);
        return [criterion.id, newCriterion];
      });
      return _.fromPairs(newCriteria);
    }

    function buildDataSource(dataSource) {
      var newDataSource = angular.copy(dataSource);
      newDataSource.scale = getScale(dataSource);
      newDataSource.unitOfMeasurement = createUnitOfMeasurement(dataSource.unitOfMeasurement);
      delete newDataSource.oldId;
      return newDataSource;
    }

    function createUnitOfMeasurement(unitOfMeasurement) {
      return {
        type: unitOfMeasurement.selectedOption.type,
        label: unitOfMeasurement.value
      };
    }

    function getScale(dataSource) {
      return [dataSource.unitOfMeasurement.lowerBound, dataSource.unitOfMeasurement.upperBound];
    }

    function buildAlternatives(alternatives) {
      return _(alternatives).keyBy('id').mapValues(function(alternative) {
        return _.pick(alternative, ['title']);
      }).value();
    }

    function buildPerformanceTable(inputData, criteria, alternatives) {
      return _(criteria)
        .map(_.partial(buildEntriesForCriterion, inputData, alternatives))
        .flatten()
        .flatten()
        .value();
    }

    function buildEntriesForCriterion(inputData, alternatives, criterion, criterionId) {
      return _.map(criterion.dataSources, function(dataSource) {
        return buildPerformanceEntries(inputData, criterionId, dataSource.id, alternatives);
      });
    }

    function buildPerformanceEntries(inputData, criterionId, dataSourceId, alternatives) {
      return _.map(alternatives, function(alternative) {
        var effectCell = inputData.effect[dataSourceId][alternative.id];
        var distributionCell = inputData.distribution[dataSourceId][alternative.id];
        return {
          alternative: alternative.id,
          criterion: criterionId,
          dataSource: dataSourceId,
          performance: buildPerformance(effectCell, distributionCell)
        };
      });
    }

    function buildPerformance(effectCell, distributionCell) {
      return {
        effect: effectCell.inputParameters.buildPerformance(effectCell),
        distribution: distributionCell.inputParameters.buildPerformance(distributionCell)
      };
    }

    function copyOldWorkspaceCriteria(workspace) {
      return _.map(workspace.problem.criteria, function(criterion) {
        var newCrit = _.pick(criterion, ['title', 'description', 'isFavorable']); // omit scales, preferences
        newCrit.dataSources = copyOldWorkspaceDataSource(criterion);
        newCrit.id = generateUuid();
        return newCrit;
      });
    }

    function copyOldWorkspaceDataSource(criterion) {
      return _.map(criterion.dataSources, function(dataSource) {
        var newDataSource = _.pick(dataSource, [
          'source',
          'sourceLink',
          'strengthOfEvidence',
          'uncertainties',
          'scale'
        ]);
        newDataSource.unitOfMeasurement = createNewUnitOfMeasurement(dataSource);
        newDataSource.id = generateUuid();
        newDataSource.oldId = dataSource.id;
        return newDataSource;
      });
    }

    function createNewUnitOfMeasurement(dataSource) {
      var newUnitOfMeasurement = {
        value: dataSource.unitOfMeasurement.label
      };
      newUnitOfMeasurement.lowerBound = dataSource.scale[0];
      newUnitOfMeasurement.upperBound = dataSource.scale[1];
      newUnitOfMeasurement.selectedOption = {
        type: dataSource.unitOfMeasurement.type
      };

      return newUnitOfMeasurement;
    }

    function createInputFromOldWorkspace(criteria, alternatives, oldWorkspace) {
      return _.reduce(oldWorkspace.problem.performanceTable, function(accum, tableEntry) {
        var dataSources = getDataSources(criteria);
        var dataSourceForEntry = _.find(dataSources, ['oldId', tableEntry.dataSource]);
        var alternative = _.find(alternatives, ['oldId', tableEntry.alternative]);
        if (dataSourceForEntry && alternative) {
          getInput(accum, dataSourceForEntry, alternative.id, tableEntry);
        }
        return accum;
      }, {
        effect: {},
        distribution: {}
      });
    }

    function getInput(accum, dataSource, alternativeId, tableEntry) {
      if (!accum.effect[dataSource.id]) {
        accum.effect[dataSource.id] = {};
        accum.distribution[dataSource.id] = {};
      }
      accum.effect[dataSource.id][alternativeId] = createCell('effect', tableEntry);
      accum.distribution[dataSource.id][alternativeId] = createCell('distribution', tableEntry);
      if (isPercentageRangeDistribution(accum.distribution[dataSource.id][alternativeId], dataSource)) {
        accum.distribution[dataSource.id][alternativeId].firstParameter = getPercentifiedRangeParameter(accum.distribution[dataSource.id][alternativeId].firstParameter);
        accum.distribution[dataSource.id][alternativeId].secondParameter = getPercentifiedRangeParameter(accum.distribution[dataSource.id][alternativeId].secondParameter);
        
      }
      return accum;
    }

    function getPercentifiedRangeParameter(parameter) {
      return significantDigits(parameter * 100);
    }

    function isPercentageRangeDistribution(distribution, dataSource) {
      return distribution &&
        distribution.inputParameters.id === 'range' &&
        dataSource.unitOfMeasurement.selectedOption.type === 'percentage';
    }

    function createCell(inputType, tableEntry) {
      var performance = tableEntry.performance[inputType];
      if (performance) {
        var type = getType(inputType, tableEntry.performance);
        return InputKnowledgeService.getOptions(inputType)[type].finishInputCell(performance);
      } else {
        return undefined;
      }
    }

    function getType(inputType, performance) {
      if (inputType === 'effect') {
        return getEffectType(performance);
      } else {
        return getDistributionType(performance);
      }
    }

    function getEffectType(performance) {
      if (performance.effect.input) {
        return determineInputType(performance.effect.input);
      } else {
        return determineEffectType(performance.effect);
      }

      function determineEffectType(effect) {
        if (effect.type === 'empty') {
          return determineEmptyType(effect);
        } else {
          return 'value';
        }
      }
    }

    function determineEmptyType(effect) {
      if (effect.value !== undefined) {
        return 'text';
      } else {
        return 'empty';
      }
    }

    function determineInputType(input) {
      if (input.hasOwnProperty('lowerBound')) {
        if (input.hasOwnProperty('value')) {
          return 'valueCI';
        } else {
          return 'range';
        }
      } else {
        return 'value';
      }
    }

    function getDistributionType(performance) {
      var types = {
        dnorm: 'normal',
        dgamma: 'gamma',
        dbeta: 'beta',
        exact: 'value',
        dsurv: 'gamma',
        dt: 'value',
        range: 'range'
      };
      if (performance.distribution.type === 'empty') {
        return performance.distribution.value ? 'text' : 'empty';
      } else {
        return types[performance.distribution.type];
      }
    }

    function findInvalidCell(inputData) {
      return _.some(inputData, function(row) {
        return _.some(row, 'isInvalid');
      });
    }

    function generateDistributions(inputData) {
      return _.mapValues(inputData.effect, _.partial(generateDistributionsForCriterion, inputData));
    }

    function generateDistributionsForCriterion(inputData, row, dataSource) {
      return _.mapValues(row, _.partial(generateDistributionForCell, inputData, dataSource));
    }

    function generateDistributionForCell(inputData, dataSource, cell, alternative) {
      if (cell.isInvalid) {
        return inputData.distribution[dataSource][alternative];
      }
      return cell.inputParameters.generateDistribution(cell);
    }

    function checkStep1Errors(state) {
      var errors = [];
      if (!state.title) {
        errors.push('Missing title');
      }
      if (state.criteria.length < 2) {
        errors.push('At least two criteria required');
      }
      if (state.alternatives.length < 2) {
        errors.push('At least two alternatives required');
      }
      if (isCriteriaMissingDataSource(state.criteria)) {
        errors.push('All criteria require at least one data source');
      }
      return errors;
    }

    function isCriteriaMissingDataSource(criteria) {
      return _.some(criteria, function(criterion) {
        return !criterion.dataSources.length;
      });
    }

    return {
      createProblem: createProblem,
      prepareInputData: prepareInputData,
      createStateFromOldWorkspace: createStateFromOldWorkspace,
      findInvalidCell: findInvalidCell,
      generateDistributions: generateDistributions,
      checkStep1Errors: checkStep1Errors
    };
  };

  return dependencies.concat(ManualInputService);
});
