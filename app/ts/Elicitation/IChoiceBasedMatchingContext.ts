import IChoiceBasedMatchingState from './Interface/IChoiceBasedMatchingState';
import IUpperRatioConstraint from './Interface/IUpperRatioConstraint';

export default interface IChoiceBasedMatchingContext {
  cbmState: IChoiceBasedMatchingState;
  currentAnswer: 'A' | 'B' | '';
  currentStep: number;
  goBack: () => void;
  setCurrentAnswer: (currentChoice: 'A' | 'B' | '') => void;
  updateState: () => void;
  isStateLoading: boolean;
  save: (preferences: IUpperRatioConstraint[]) => void;
  cancel: () => void;
  setCurrentStep: (step: number) => void;
}
