import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import React, {useContext} from 'react';
import {ChoiceBasedMatchingContext} from '../ChoiceBasedMatchingContext';
import ChoiceBasedMatchingButtons from './ChoiceBasedMatchingButtons/ChoiceBasedMatchingButtons';
import ChoiceBasedMatchingQuestionAndAnswer from './ChoiceBasedMatchingQuestionAndAnswer/ChoiceBasedMatchingQuestionAndAnswer';
import FinalChoiceBasedMatchingScreen from './FinalChoiceBasedMatchingScreen/FinalChoiceBasedMatchingScreen';

export default function ChoiceBasedMatchingElicitation() {
  const {cbmState, currentStep} = useContext(ChoiceBasedMatchingContext);

  return (
    <Grid container item spacing={4} sm={12} md={6} component={Paper}>
      <Grid item xs={12}>
        <Typography id="choice-based-matching-title-header" variant="h4">
          Choice-based Matching
        </Typography>
      </Grid>
      {cbmState.preferences ? (
        <FinalChoiceBasedMatchingScreen />
      ) : (
        <ChoiceBasedMatchingQuestionAndAnswer />
      )}
      <Grid item xs={9}>
        <ChoiceBasedMatchingButtons />
      </Grid>
      <Grid item xs={3} container alignItems="center" justify="flex-end">
        <Grid id="step-counter" item>
          Step {currentStep}
        </Grid>
      </Grid>
    </Grid>
  );
}
