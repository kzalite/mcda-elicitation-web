import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import React from 'react';
import {ChoiceBasedMatchingContextProviderComponent} from '../ChoiceBasedMatchingContext';
import IInputCriterion from '../Interface/IInputCriterion';
import IUpperRatioConstraint from '../Interface/IUpperRatioConstraint';
import {PreferencesContextProviderComponent} from '../PreferencesContext';
import ChoiceBasedMatchingElicitation from './ChoiceBasedMatchingElicitation/ChoiceBasedMatchingElicitation';

export default function ChoiceBasedMatchingElicitationWrapper({
  criteria,
  save,
  cancel
}: {
  criteria: IInputCriterion[];
  save: (preferences: IUpperRatioConstraint[]) => void;
  cancel: () => void;
}) {
  return (
    <PreferencesContextProviderComponent inputCriteria={criteria}>
      <ChoiceBasedMatchingContextProviderComponent cancel={cancel} save={save}>
        <Grid container justify="center" component={Box} mt={2}>
          <ChoiceBasedMatchingElicitation />
        </Grid>
      </ChoiceBasedMatchingContextProviderComponent>
    </PreferencesContextProviderComponent>
  );
}
