import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import {ErrorContextProviderComponent} from 'app/ts/Error/ErrorContext';
import React from 'react';
import {ChoiceBasedMatchingContextProviderComponent} from '../ChoiceBasedMatchingContext';
import IInputCriterion from '../Interface/IInputCriterion';
import IUpperRatioConstraint from '../Interface/IUpperRatioConstraint';
import {PreferencesContextProviderComponent} from '../PreferencesContext';
import ChoiceBasedMatchingElicitation from './ChoiceBasedMatchingElicitation';

export default function ChoiceBasedMatchingElicitationWrapper({
  criteria,
  save,
  cancel,
  scenarioId,
  subproblemId,
  workspaceId
}: {
  criteria: IInputCriterion[];
  save: (preferences: IUpperRatioConstraint[]) => void;
  cancel: () => void;
  scenarioId: string;
  subproblemId: string;
  workspaceId: string;
}) {
  return (
    <ErrorContextProviderComponent>
      <PreferencesContextProviderComponent
        inputCriteria={criteria}
        scenarioId={scenarioId}
        subproblemId={subproblemId}
        workspaceId={workspaceId}
      >
        <ChoiceBasedMatchingContextProviderComponent
          cancel={cancel}
          save={save}
        >
          <Grid container justify="center" component={Box} mt={2}>
            <ChoiceBasedMatchingElicitation />
          </Grid>
        </ChoiceBasedMatchingContextProviderComponent>
      </PreferencesContextProviderComponent>
    </ErrorContextProviderComponent>
  );
}
