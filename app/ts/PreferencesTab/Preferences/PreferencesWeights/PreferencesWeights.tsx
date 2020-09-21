import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import React, {useContext} from 'react';
import {PreferencesContext} from '../../PreferencesContext';
import PreferencesWeightsButtons from './PreferencesWeightsButtons/PreferencesWeightsButtons';
import PreferencesWeightsTable from './PreferencesWeightsTable/PreferencesWeightsTable';

export default function PreferencesWeights() {
  const {determineElicitationMethod} = useContext(PreferencesContext);

  return (
    <Grid item container>
      <Grid item xs={12}>
        <Typography variant="h4">Weights</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography id="elicitation-method">
          Elicitation method: {determineElicitationMethod()}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <PreferencesWeightsTable />
      </Grid>
      <Grid item xs={12}>
        <PreferencesWeightsButtons />
      </Grid>
    </Grid>
  );
}