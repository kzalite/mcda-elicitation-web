import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import {ChoiceBasedMatchingContext} from 'app/ts/Elicitation/ChoiceBasedMatchingContext';
import {PreferencesContext} from 'app/ts/Elicitation/PreferencesContext';
import React, {useContext, useEffect, useState} from 'react';

export default function ChoiceBasedMatchingButtons() {
  const {
    cbmState,
    currentAnswer,
    goBack,
    updateState,
    isStateLoading,
    cancel,
    save,
    currentStep,
    setCurrentStep
  } = useContext(ChoiceBasedMatchingContext);
  const {criteria} = useContext(PreferencesContext);

  const [isNextDisabled, setIsNextDisabled] = useState(true);

  useEffect(checkIsNextEnabled, [currentAnswer, cbmState]);

  function checkIsNextEnabled() {
    setIsNextDisabled(currentAnswer === '' && !cbmState.preferences);
  }

  function handleNextButtonClick() {
    setCurrentStep(currentStep + 1);
    if (cbmState.preferences) {
      save(cbmState.preferences);
    } else {
      updateState();
    }
  }

  function handlePreviousClick() {
    setCurrentStep(currentStep - 1);
    setIsNextDisabled(false);
    goBack();
  }

  return (
    <ButtonGroup>
      <Button
        id="cancel-button"
        onClick={cancel}
        color="primary"
        variant="contained"
      >
        Cancel
      </Button>
      <Button
        id="previous-button"
        onClick={handlePreviousClick}
        color="primary"
        variant="contained"
        disabled={isStateLoading}
      >
        Previous
      </Button>

      <Button
        disabled={isNextDisabled || isStateLoading}
        color="primary"
        id="next-button"
        variant="contained"
        onClick={handleNextButtonClick}
      >
        Next
      </Button>
    </ButtonGroup>
  );
}
