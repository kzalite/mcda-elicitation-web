'use strict';
define(['angular', 'angular-mocks', 'mcda/preferences/preferences'], function(angular) {
  describe('the TradeOffService', function() {
    var tradeOffService;
    var taskResultsDefer;
    var pataviResultsServiceMock = jasmine.createSpyObj('PataviResultsService', ['postAndHandleResults']);
    var workspaceSettingsServiceMock = jasmine.createSpyObj('WorkspaceSettingsService', ['usePercentage']);

    beforeEach(angular.mock.module('elicit.preferences', function($provide) {
      $provide.value('PataviResultsService', pataviResultsServiceMock);
      $provide.value('WorkspaceSettingsService', workspaceSettingsServiceMock);
    }));

    beforeEach(inject(function($q, TradeOffService) {
      tradeOffService = TradeOffService;
      taskResultsDefer = $q.defer();
    }));

    describe('getElicitationTradeOffCurve', function() {
      beforeEach(function() {
        var taskResultsPromise = taskResultsDefer.promise;
        pataviResultsServiceMock.postAndHandleResults.and.returnValue(taskResultsPromise);
      });

      afterEach(function() {
        pataviResultsServiceMock.postAndHandleResults.calls.reset();
      });

      it('should attach the x, and y criteria, their x and y and chosen y value', function() {
        var mostImportantId = 'mostImportantId';
        var secondaryId = 'secondaryId';
        var mostImportantCriterion = {
          id: mostImportantId,
          worst: 0.5,
          dataSources: [{ merge: 'this' }]
        };
        var secondaryCriterion = {
          id: secondaryId,
          best: 10,
          dataSources: [{ merge: 'this' }]
        };
        var chosenValue = 37;
        tradeOffService.getElicitationTradeOffCurve(mostImportantCriterion, secondaryCriterion, chosenValue);
        expect(pataviResultsServiceMock.postAndHandleResults).toHaveBeenCalledWith({
          criteria: {
            mostImportantId: {
              id: mostImportantId,
              worst: 0.5,
              merge: 'this'
            },
            secondaryId: {
              id: secondaryId,
              best: 10,
              merge: 'this'
            }
          },
          method: 'matchingElicitationCurve',
          indifferenceCurve: {
            criterionX: secondaryCriterion.id,
            criterionY: mostImportantCriterion.id,
            x: secondaryCriterion.best,
            y: mostImportantCriterion.worst,
            chosenY: chosenValue
          }
        });
      });
    });

    describe('getIndifferenceCurve', function() {
      beforeEach(function() {
        var taskResultsPromise = taskResultsDefer.promise;
        pataviResultsServiceMock.postAndHandleResults.and.returnValue(taskResultsPromise);
      });

      afterEach(function() {
        pataviResultsServiceMock.postAndHandleResults.calls.reset();
      });

      it('should attach the selected coordinates and criteria, query R and return a promise for the results', function() {
        var problem = {};
        var criteria = {
          firstCriterion: {
            id: 'crit1'
          },
          secondCriterion: {
            id: 'crit2'
          }
        };
        var coordinates = { x: 1, y: 2 };
        tradeOffService.getIndifferenceCurve(problem, criteria, coordinates);
        expect(pataviResultsServiceMock.postAndHandleResults).toHaveBeenCalledWith({
          criteria: {},
          method: 'indifferenceCurve',
          indifferenceCurve: {
            criterionX: 'crit1',
            criterionY: 'crit2',
            x: 1,
            y: 2
          }
        });
      });
    });

    describe('getInitialSettings', function() {
      it('should return new initialization settings', function() {
        var root = 'root';
        var data = [];
        var sliderOptions = {
          floor: 0,
          ceil: 100
        };
        var settings = {
          firstCriterion: {
            title: 'firstTitle',
            dataSources: [{
              scale: [-Infinity, Infinity],
              unitOfMeasurement: {
                type: 'custom',
                label: ''
              }
            }]
          },
          secondCriterion: {
            title: 'secondTitle',
            dataSources: [{
              unitOfMeasurement: {
                label: 'uom',
                type: 'custom'
              },
              scale: [-Infinity, Infinity]
            }]
          }
        };
        var coordRanges = {
          minX: sliderOptions.floor,
          maxX: sliderOptions.ceil,
          minY: 0,
          maxY: 10
        };
        var result = tradeOffService.getInitialSettings(root, data, coordRanges, settings);

        expect(result.bindto).toEqual('root');
        expect(result.data).toEqual([]);
        expect(result.axis.x.min).toEqual(0);
        expect(result.axis.x.max).toEqual(100);
        expect(result.axis.x.label).toEqual('firstTitle');
        expect(result.axis.y.min).toEqual(0);
        expect(result.axis.y.max).toEqual(10);
        expect(result.axis.y.default).toEqual([0, 10]);
        expect(result.axis.y.label).toEqual('secondTitle (uom)');
      });
    });

    describe('getYValue', function() {
      var xValues;
      var yValues;
      beforeEach(function() {
        xValues = ['values_x', 25, 40, 60, 80];
        yValues = ['values', 0, 40, 60, 100];
      });

      it('should calculate the y value for the given x coordinate and x and y cutoffs, ', function() {
        var x = 50;
        var result = tradeOffService.getYValue(x, xValues, yValues);
        expect(result).toEqual({ x: 50, y: 50 });
      });

      it('should return the nearest cutoff if the x does not fall on the line', function() {
        var xTooSmall = 10;
        var smallResult = tradeOffService.getYValue(xTooSmall, xValues, yValues);
        expect(smallResult).toEqual({ x: 25, y: 0 });
        var xTooLarge = 90;
        var largeResult = tradeOffService.getYValue(xTooLarge, xValues, yValues);
        expect(largeResult).toEqual({ x: 80, y: 100 });
      });

      it('should work for an x that is on a cutoff point', function() {
        var x = 60;
        var result = tradeOffService.getYValue(x, xValues, yValues);
        expect(result).toEqual({ x: 60, y: 60 });
      });
    });

    describe('areCoordinatesSet', function() {
      function xy(x, y) { return { x: x, y: y }; }

      it('should return true if given coordinates are defined', function() {
        var coordinates = xy(1, -2);
        var result = tradeOffService.areCoordinatesSet(coordinates);
        expect(result).toBeTruthy();
      });

      it('should return false if one of the coordinates has an invalid value', function() {
        var coordinatesUndefined = xy(1, undefined);
        var resultUndefined = tradeOffService.areCoordinatesSet(coordinatesUndefined);
        expect(resultUndefined).toBeFalsy();

        var coordinatesMissing = { x: 1 };
        var resultMissing = tradeOffService.areCoordinatesSet(coordinatesMissing);
        expect(resultMissing).toBeFalsy();

        var coordinatesNaN = xy(1, NaN);
        var resultNaN = tradeOffService.areCoordinatesSet(coordinatesNaN);
        expect(resultNaN).toBeFalsy();

        var coordinatesNull = xy(1, null);
        var resultNull = tradeOffService.areCoordinatesSet(coordinatesNull);
        expect(resultNull).toBeFalsy();
      });
    });

    describe('getLabel', function() {
      it('should return the label for the axis of a non-percentifiable criterion', function() {
        var continuousCriterion = {
          title: 'contCrit',
          dataSources: [{
            unitOfMeasurement: {
              label: 'kg',
              type: 'custom'
            }
          }]
        };
        var result = tradeOffService.getLabel(continuousCriterion);
        var expectedResult = 'contCrit (kg)';
        expect(result).toEqual(expectedResult);
      });
    });
  });
});
