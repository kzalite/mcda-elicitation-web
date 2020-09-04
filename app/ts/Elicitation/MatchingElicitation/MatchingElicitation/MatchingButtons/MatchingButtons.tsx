import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import {
  buildPreciseSwingAnsers,
  buildPreciseSwingPreferences
} from 'app/ts/Elicitation/ElicitationUtil';
import IExactSwingRatio from 'app/ts/Elicitation/Interface/IExactSwingRatio';
import React, {useContext} from 'react';
import {ElicitationContext} from '../../../ElicitationContext';
import IPreciseSwingAnswer from '../../../Interface/IPreciseSwingAnswer';

export default function MatchingButtons() {
  const {
    mostImportantCriterion,
    isNextDisabled,
    setIsNextDisabled,
    criteria,
    setImportance,
    currentStep,
    setCurrentStep,
    cancel,
    save
  } = useContext(ElicitationContext);

  function handleNextButtonClick() {
    if (isLastStep()) {
      finishElicitation();
    } else {
      matchingNext();
    }
  }

  function finishElicitation() {
    const answers: IPreciseSwingAnswer[] = buildPreciseSwingAnsers(criteria);
    const preferences: IExactSwingRatio[] = buildPreciseSwingPreferences(
      mostImportantCriterion.mcdaId,
      answers
    );
    save(preferences);
  }

  function matchingNext() {
    setCurrentStep(currentStep + 1);

    if (currentStep === 1) {
      setImportance(mostImportantCriterion.mcdaId, 100);
    }
  }

  function isLastStep() {
    return currentStep === criteria.size;
  }

  function handlePreviousClick() {
    setIsNextDisabled(false);
    setCurrentStep(currentStep - 1);
  }

  //FIXME: tooltips cause errors?
  // function getTooltipMessage() {
  //   if (currentStep === 1 && isNextDisabled) {
  //     return 'Please select a criterion to proceed';
  //   } else if (isNextDisabled) {
  //     return 'Alternative A and Alternative B values must differ';
  //   } else {
  //     return '';
  //   }
  // }

  return (
    <ButtonGroup>
      <Button
        id="cancel-button"
        color="primary"
        variant="contained"
        onClick={cancel}
      >
        Cancel
      </Button>
      <Button
        id="previous-button"
        onClick={handlePreviousClick}
        color="primary"
        variant="contained"
        disabled={currentStep === 1}
      >
        Previous
      </Button>
      <Button
        disabled={isNextDisabled}
        color="primary"
        id="next-button"
        variant="contained"
        onClick={handleNextButtonClick}
      >
        {isLastStep() ? 'Save' : 'Next'}
      </Button>
    </ButtonGroup>
  );
}
