import IChoiceBasedMatchingState from '../Interface/IChoiceBasedMatchingState';
import IElicitationCriterion from '../Interface/IElicitationCriterion';
import {buildInitialState} from './ChoiceBasedMatchingUtil';

describe('buildInitialState', () => {
  it('should build the CBM state with criteria with sorted scales', () => {
    const criteria: Record<string, IElicitationCriterion> = {
      critId1: {
        id: 'critId1',
        description: 'desc',
        scales: [1, 0],
        title: 'title',
        unitOfMeasurement: '',
        pvfDirection: 'increasing'
      }
    };
    const result: IChoiceBasedMatchingState = buildInitialState(criteria);
    const expectedResult: IChoiceBasedMatchingState = {
      answersAndQuestions: [],
      criteria: [
        {
          id: 'critId1',
          pvf: {
            direction: 'increasing',
            range: [0, 1],
            type: 'linear'
          }
        }
      ]
    };
    expect(result).toEqual(expectedResult);
  });
});
