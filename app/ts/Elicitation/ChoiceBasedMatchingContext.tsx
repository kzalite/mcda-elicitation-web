import Axios, {AxiosError, AxiosResponse} from 'axios';
import _ from 'lodash';
import React, {createContext, useContext, useEffect, useState} from 'react';
import IChoiceBasedMatchingContext from './IChoiceBasedMatchingContext';
import IChoiceBasedMatchingState from './Interface/IChoiceBasedMatchingState';
import IUpperRatioConstraint from './Interface/IUpperRatioConstraint';
import {PreferencesContext} from './PreferencesContext';

export const ChoiceBasedMatchingContext = createContext<
  IChoiceBasedMatchingContext
>({} as IChoiceBasedMatchingContext);

export function ChoiceBasedMatchingContextProviderComponent({
  children,
  save,
  cancel
}: {
  children: any;
  save: (preferences: IUpperRatioConstraint[]) => void;
  cancel: () => void;
}) {
  // const {setError} = useContext(ErrorContext); //fixme
  const {criteria} = useContext(PreferencesContext);

  const initialState: IChoiceBasedMatchingState = {
    answersAndQuestions: [],
    criteria: _.map(criteria, (criterion) => {
      const sortedScales = _.sortBy(criterion.scales) as [number, number];
      return {
        id: criterion.mcdaId,
        pvf: {
          direction: criterion.pvfDirection,
          range: sortedScales,
          type: 'linear'
        }
      };
    })
  };
  const [currentAnswer, setCurrentAnswer] = useState<'A' | 'B' | ''>('');
  const [cbmState, setCbmState] = useState(initialState);
  const [isStateLoading, setIsStateLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(updateState, []);

  function updateState() {
    setIsStateLoading(true);
    let newState = _.cloneDeep(cbmState);
    if (currentAnswer) {
      newState.answersAndQuestions[
        newState.answersAndQuestions.length - 1
      ].answer = currentAnswer;
    }
    Axios.post(
      `/workspaces/2630/problems/2800/scenarios/3334/cbmState`,
      newState
    )
      .then((response: AxiosResponse<IChoiceBasedMatchingState>) => {
        setCurrentAnswer('');
        setCbmState(response.data);
        setIsStateLoading(false);
      })
      .catch((error: AxiosError) => {
        // setError(error.message + ', ' + error.response!.data);
      });
  }

  function goBack() {
    let newState = _.cloneDeep(cbmState);
    if (newState.preferences) {
      delete newState.preferences;
    } else {
      newState.answersAndQuestions.pop();
    }
    if (newState.answersAndQuestions.length) {
      const lastAnswer = newState.answersAndQuestions[
        newState.answersAndQuestions.length - 1
      ].answer!;
      setCurrentAnswer(lastAnswer);
    }
    setCbmState(newState);
  }

  return (
    <ChoiceBasedMatchingContext.Provider
      value={{
        cbmState,
        currentAnswer,
        currentStep,
        goBack,
        setCurrentAnswer,
        updateState,
        isStateLoading,
        save,
        cancel,
        setCurrentStep
      }}
    >
      {children}
    </ChoiceBasedMatchingContext.Provider>
  );
}
