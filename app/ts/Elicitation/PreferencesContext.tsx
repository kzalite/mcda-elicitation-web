import React, {createContext} from 'react';
import {buildElicitationCriteria} from './ElicitationUtil';
import IInputCriterion from './Interface/IInputCriterion';
import IPreferencesContext from './IPreferencesContext';

export const PreferencesContext = createContext<IPreferencesContext>(
  {} as IPreferencesContext
);

export function PreferencesContextProviderComponent({
  inputCriteria,
  scenarioId,
  subproblemId,
  workspaceId,
  children
}: {
  inputCriteria: IInputCriterion[];
  scenarioId: string;
  subproblemId: string;
  workspaceId: string;
  children: any;
}) {
  return (
    <PreferencesContext.Provider
      value={{
        criteria: buildElicitationCriteria(inputCriteria),
        scenarioId: scenarioId,
        subproblemId: subproblemId,
        workspaceId: workspaceId
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}
