import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import React, {useContext} from 'react';
import {ElicitationContext} from '../../ElicitationContext';
import MostImportantChoice from '../../MostImportantChoice/MostImportantChoice';
import PreciseSwingButtons from './PreciseSwingButtons/PreciseSwingButtons';
import PreciseSwingSetWeights from './PreciseSwingSetWeights/PreciseSwingSetWeights';

export default function PreciseSwingWeighting() {
  const {currentStep} = useContext(ElicitationContext);

  return (
    <Grid container item spacing={4} sm={12} md={6} component={Paper}>
      <Grid item xs={12}>
        {currentStep === 1 ? (
          <MostImportantChoice />
        ) : (
          <PreciseSwingSetWeights />
        )}
      </Grid>
      <Grid item xs={9}>
        <PreciseSwingButtons />
      </Grid>
      <Grid item xs={3} container alignItems="center" justify="flex-end">
        <Grid item>Step {currentStep} of 2</Grid>
      </Grid>
    </Grid>
  );
}