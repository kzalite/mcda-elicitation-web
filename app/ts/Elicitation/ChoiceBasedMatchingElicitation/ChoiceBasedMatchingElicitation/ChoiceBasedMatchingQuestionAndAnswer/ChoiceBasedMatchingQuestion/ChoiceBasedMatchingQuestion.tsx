import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import {ChoiceBasedMatchingContext} from 'app/ts/Elicitation/ChoiceBasedMatchingContext';
import {PreferencesContext} from 'app/ts/Elicitation/PreferencesContext';
import _ from 'lodash';
import React, {useContext} from 'react';
import IChoiceBasedMatchingQuestion from '../../../../Interface/IChoiceBasedMatchingQuestion';

export default function ChoiceBasedMatchingQuestion({
  currentQuestion
}: {
  currentQuestion: IChoiceBasedMatchingQuestion;
}) {
  const {criteria} = useContext(PreferencesContext);
  const {cbmState} = useContext(ChoiceBasedMatchingContext);
  const questionNumber = cbmState.answersAndQuestions.length;

  const criterion1 = getCriterionInfo(currentQuestion.criterionIds[0]);
  const criterion2 = getCriterionInfo(currentQuestion.criterionIds[1]);

  function getCriterionInfo(
    criterionId: string
  ): {title: string; description: string} {
    const row = _.find(criteria, ['mcdaId', criterionId]);
    return {
      title: row ? row.title : '',
      description: row && row.description ? row.description : ''
    };
  }

  return currentQuestion ? (
    <>
      <Grid item xs={12}>
        <h5>Choosing between treatments</h5>
      </Grid>
      <Grid item xs={12}>
        <b>Q{questionNumber}:</b> Please consider the following two treatment
        options, A and B:
      </Grid>
      <Grid item xs={12}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Criterion</TableCell>
              <TableCell>Treatment A</TableCell>
              <TableCell>Treatment B</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <Tooltip
                  disableHoverListener={!criterion1.description}
                  title={criterion1.description}
                >
                  <span className="criterion-title">{criterion1.title}</span>
                </Tooltip>
              </TableCell>
              <TableCell>{currentQuestion.A.criterion1Value}</TableCell>
              <TableCell>{currentQuestion.B.criterion1Value}</TableCell>
            </TableRow>
          </TableBody>
          <TableBody>
            <TableRow>
              <TableCell>
                <Tooltip
                  disableHoverListener={!criterion2.description}
                  title={criterion2.description}
                >
                  <span className="criterion-title">{criterion2.title}</span>
                </Tooltip>
              </TableCell>
              <TableCell>{currentQuestion.A.criterion2Value}</TableCell>
              <TableCell>{currentQuestion.B.criterion2Value}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Grid>
      <Grid item xs={12}>
        Based on this information, which treatment would you prefer?
      </Grid>
    </>
  ) : (
    <></>
  );
}
