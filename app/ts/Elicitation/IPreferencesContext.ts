import IElicitationCriterion from './Interface/IElicitationCriterion';

export default interface IPreferencesContext {
  criteria: Record<string, IElicitationCriterion>;
  scenarioId: string;
  subproblemId: string;
  workspaceId: string;
}
