import {CircularProgress, Grid, Typography} from '@material-ui/core';
import InlineHelp from 'app/ts/InlineHelp/InlineHelp';
import React, {useContext} from 'react';
import {DeterministicResultsContext} from '../../DeterministicResultsContext/DeterministicResultsContext';
import MeasurementSensitivity from './MeasurementSensitivity/MeasurementSensitivity';
import PreferencesSensitivity from './PreferencesSensitivity/PreferencesSensitivity';

export default function SensitivityAnalysis(): JSX.Element {
  const {
    measurementsSensitivityResults,
    preferencesSensitivityResults
  } = useContext(DeterministicResultsContext);
  return (
    <Grid container item xs={12} spacing={1}>
      <Grid item xs={12}>
        <Typography variant="h5">
          One-way sensitivity analysis{' '}
          <InlineHelp helpId="one-way-sensitivity-analysis" />
        </Typography>
      </Grid>
      <Grid item xs={6}>
        {measurementsSensitivityResults ? (
          <MeasurementSensitivity />
        ) : (
          <CircularProgress />
        )}
      </Grid>

      <Grid item xs={6}>
        {preferencesSensitivityResults ? (
          <PreferencesSensitivity />
        ) : (
          <CircularProgress />
        )}
      </Grid>
    </Grid>
  );
}
