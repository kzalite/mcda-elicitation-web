'use strict';
define(['lodash'], function(_) {
  var dependencies = [
    'ConstraintService',
    'PerformanceService',
    'GenerateDistributionService',
    'FinishInputCellService',
    'ToStringService'
  ];
  var InputKnowledgeService = function(
    ConstraintService,
    PerformanceService,
    GenerateDistributionService,
    FinishInputCellService,
    ToStringService
  ) {
    var INPUT_TYPE_KNOWLEDGE = {
      getKnowledge: function(inputType) {
        return this[inputType].getKnowledge();
      },
      distribution: {
        getOptions: getDistributionOptions
      },
      effect: {
        getOptions: getEffectOptions
      }
    };

    function getEffectOptions() {
      return {
        value: VALUE,
        valueCI: VALUE_CONFIDENCE_INTERVAL,
        range: RANGE_EFFECT,
        empty: EMPTY,
        text: TEXT
      };
    }

    function getDistributionOptions() {
      return {
        normal: NORMAL,
        beta: BETA,
        gamma: GAMMA,
        value: VALUE,
        range: RANGE_DISTRIBUTION,
        empty: EMPTY,
        text: TEXT
      };
    }
    var parameterNotUsed;
    var useConstraints = true;
    var dontUseConstraints = false;

    var NORMAL = new optionsBlock(
      'normal',
      'Normal',
      buildDefined('Mean'),
      buildPositiveFloat('Standard error'),
      parameterNotUsed,
      useConstraints,
      ToStringService.normalToString,
      PerformanceService.buildNormalPerformance,
      FinishInputCellService.finishNormalInputCell
    );

    var BETA = new optionsBlock(
      'beta',
      'Beta',
      buildIntegerAboveZero('Alpha'),
      buildIntegerAboveZero('Beta'),
      parameterNotUsed,
      dontUseConstraints,
      ToStringService.betaToString,
      PerformanceService.buildBetaPerformance,
      FinishInputCellService.finishBetaCell
    );

    var GAMMA = new optionsBlock(
      'gamma',
      'Gamma',
      buildFloatAboveZero('Alpha'),
      buildFloatAboveZero('Beta'),
      parameterNotUsed,
      dontUseConstraints,
      ToStringService.gammaToString,
      PerformanceService.buildGammaPerformance,
      FinishInputCellService.finishGammaCell
    );

    var VALUE = new effectOptionsBlock(
      'value',
      'Value',
      buildDefined('Value'),
      parameterNotUsed,
      parameterNotUsed,
      useConstraints,
      ToStringService.valueToString,
      PerformanceService.buildValuePerformance,
      FinishInputCellService.finishValueCell,
      GenerateDistributionService.generateValueDistribution
    );

    var VALUE_CONFIDENCE_INTERVAL = new effectOptionsBlock(
      'valueCI',
      'Value, 95% C.I.',
      buildDefined('Value'),
      buildLowerBound(),
      buildUpperBound(),
      useConstraints,
      ToStringService.valueCIToString,
      PerformanceService.buildValueCIPerformance,
      FinishInputCellService.finishValueCI,
      _.partial(GenerateDistributionService.generateValueCIDistribution, NORMAL, VALUE)
    );

    var RANGE_DISTRIBUTION = new optionsBlock(
      'range',
      'Range',
      buildLowerRange(),
      buildUpperBound(),
      parameterNotUsed,
      useConstraints,
      ToStringService.rangeToString,
      PerformanceService.buildRangeDistribtutionPerformance,
      FinishInputCellService.finishRangeDistributionCell
    );

    var RANGE_EFFECT = new effectOptionsBlock(
      'range',
      'Range',
      buildLowerRange(),
      buildUpperBound(),
      parameterNotUsed,
      useConstraints,
      ToStringService.rangeToString,
      PerformanceService.buildRangeEffectPerformance,
      FinishInputCellService.finishRangeEffectCell,
      _.partial(GenerateDistributionService.generateRangeDistribution, RANGE_DISTRIBUTION)
    );

    var EMPTY = new effectOptionsBlock(
      'empty',
      'Empty cell',
      parameterNotUsed,
      parameterNotUsed,
      parameterNotUsed,
      dontUseConstraints,
      ToStringService.emptyToString,
      PerformanceService.buildEmptyPerformance,
      FinishInputCellService.finishEmptyCell,
      GenerateDistributionService.generateEmptyDistribution
    );

    var TEXT = new effectOptionsBlock(
      'text',
      'Text',
      buildNotEmpty(),
      parameterNotUsed,
      parameterNotUsed,
      dontUseConstraints,
      ToStringService.textToString,
      PerformanceService.buildTextPerformance,
      FinishInputCellService.finishTextCell,
      GenerateDistributionService.generateEmptyDistribution
    );

    /**********
     * public *
     **********/

    function getOptions(inputType) {
      return INPUT_TYPE_KNOWLEDGE[inputType].getOptions();
    }

    /***********
     * private *
     ***********/

    function optionsBlock(id, label, firstParameter, secondParameter, thirdParameter, constraints, toString, buildPerformance, finishInputCell) {
      this.id = id;
      this.label = label;
      if (firstParameter) {
        this.firstParameter = firstParameter;
      }
      if (secondParameter) {
        this.secondParameter = secondParameter;
      }
      if (thirdParameter) {
        this.thirdParameter = thirdParameter;
      }
      this.constraints = constraints;
      this.toString = toString;
      this.buildPerformance = buildPerformance;
      this.finishInputCell = _.partial(finishInputCell, this);
    }

    function effectOptionsBlock(id, label, firstParameter, secondParameter, thirdParameter, constraints, toString, buildPerformance, finishInputCell, generateDistribution) {
      optionsBlock.call(this, id, label, firstParameter, secondParameter, thirdParameter, constraints, toString, buildPerformance, finishInputCell);
      this.generateDistribution = generateDistribution;
    }

    function buildUpperBound() {
      return {
        label: 'Upper bound',
        constraints: [
          ConstraintService.defined(),
          ConstraintService.aboveOrEqualTo('firstParameter')
        ]
      };
    }

    function buildLowerBound() {
      return {
        label: 'Lower bound',
        constraints: [
          ConstraintService.defined(),
          ConstraintService.belowOrEqualTo('firstParameter')
        ]
      };
    }

    function buildLowerRange() {
      return {
        label: 'Lower bound',
        constraints: [
          ConstraintService.defined(),
          ConstraintService.belowOrEqualTo('secondParameter')
        ]
      };
    }

    function buildIntegerAboveZero(label) {
      var param = buildFloatAboveZero(label);
      param.constraints.push(ConstraintService.integer());
      return param;
    }

    function buildPositiveFloat(label) {
      var param = buildDefined(label);
      param.constraints.push(ConstraintService.positive());
      return param;
    }

    function buildFloatAboveZero(label) {
      var param = buildDefined(label);
      param.constraints.push(ConstraintService.above(0));
      return param;
    }

    function buildDefined(label) {
      return {
        label: label,
        constraints: [ConstraintService.defined()]
      };
    }

    function buildNotEmpty() {
      return {
        label: 'Text',
        constraints: [ConstraintService.notEmpty()]
      };
    }

    return {
      getOptions: getOptions
    };

  };
  return dependencies.concat(InputKnowledgeService);
});
