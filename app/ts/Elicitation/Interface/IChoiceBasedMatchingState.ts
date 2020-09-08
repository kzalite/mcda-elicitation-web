import IAnswerAndQuestion from './IAnswerAndQuestion';
import IReducedCriterion from './IReducedCriterion';
import IUpperRatioConstraint from './IUpperRatioConstraint';

export default interface IChoiceBasedMatchingState {
  preferences?: IUpperRatioConstraint[];
  answersAndQuestions: IAnswerAndQuestion[];
  criteria: IReducedCriterion[];
}
