import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import {ChoiceBasedMatchingContext} from 'app/ts/Elicitation/ChoiceBasedMatchingContext';
import IChoiceBasedMatchingQuestion from 'app/ts/Elicitation/Interface/IChoiceBasedMatchingQuestion';
import {ErrorContext} from 'app/ts/Error/ErrorContext';
import React, {ChangeEvent, useContext, useEffect, useState} from 'react';
import ChoiceBasedMatchingQuestion from './ChoiceBasedMatchingQuestion/ChoiceBasedMatchingQuestion';

export default function ChoiceBasedMatchingQuestionAndAnswer() {
  const {setError} = useContext(ErrorContext);
  const {
    currentAnswer,
    setCurrentAnswer,
    cbmState,
    isStateLoading
  } = useContext(ChoiceBasedMatchingContext);

  const [currentQuestion, setCurrentQuestion] = useState<
    IChoiceBasedMatchingQuestion
  >();
  useEffect(getCurrentQuestion, [cbmState]);

  function getCurrentQuestion() {
    if (cbmState.answersAndQuestions.length) {
      const [newCurrent] = cbmState.answersAndQuestions.slice(-1);
      setCurrentQuestion(newCurrent.question);
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const newValue = event.target.value;
    if (newValue !== 'A' && newValue !== 'B') {
      setError('Invalid alternative choice');
    } else {
      setCurrentAnswer(newValue);
    }
  }

  return !isStateLoading && currentQuestion ? (
    <>
      <ChoiceBasedMatchingQuestion currentQuestion={currentQuestion} />
      <Grid item xs={12}>
        <RadioGroup
          name="treatment-preference-radio"
          value={currentAnswer}
          onChange={handleChange}
        >
          <label id="treatment-a">
            <Radio value="A" />
            Treatment A
          </label>
          <label id="treatment-b">
            <Radio value="B" />
            Treatment B
          </label>
        </RadioGroup>
      </Grid>
    </>
  ) : (
    <Grid item xs={12}>
      <CircularProgress />
    </Grid>
  );
}
