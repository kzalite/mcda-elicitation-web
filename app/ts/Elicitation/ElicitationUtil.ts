import _ from 'lodash';
import IElicitationCriterion from './Interface/IElicitationCriterion';
import IInputCriterion from './Interface/IInputCriterion';

export function buildElicitationCriteria(
  input: IInputCriterion[]
): Record<string, IElicitationCriterion> {
  return _(input)
    .map((criterion: IInputCriterion) => {
      const elicitationCriterion: IElicitationCriterion = {
        mcdaId: criterion.id,
        title: criterion.title,
        scales: [criterion.worst, criterion.best],
        unitOfMeasurement: criterion.dataSources[0].unitOfMeasurement.label,
        pvfDirection: criterion.dataSources[0].pvf.direction,
        description: criterion.description
      };
      return [criterion.id, elicitationCriterion];
    })
    .fromPairs()
    .value();
}
