import _ from 'lodash';
import IChoiceBasedMatchingState from '../Interface/IChoiceBasedMatchingState';
import IElicitationCriterion from '../Interface/IElicitationCriterion';

export function buildInitialState(
  criteria: Record<string, IElicitationCriterion>
): IChoiceBasedMatchingState {
  return {
    answersAndQuestions: [],
    criteria: _.map(criteria, (criterion: IElicitationCriterion) => {
      const sortedScales = _.sortBy(criterion.scales) as [number, number];
      return {
        id: criterion.id,
        pvf: {
          direction: criterion.pvfDirection,
          range: sortedScales,
          type: 'linear'
        }
      };
    })
  };
}
