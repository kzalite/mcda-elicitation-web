import IChoiceBasedMatchingState from 'app/ts/Elicitation/Interface/IChoiceBasedMatchingState';
import Axios, {AxiosError, AxiosResponse} from 'axios';
import {Request, Response} from 'express';
import fs from 'fs';
import https from 'https';
import _ from 'lodash';
import {client as WebSocketClient, connection, IMessage} from 'websocket';
import logger from './logger';

export default function getChoiceBasedMatchingState(
  request: Request,
  response: Response
) {
  const {
    PATAVI_HOST,
    PATAVI_PORT,
    PATAVI_CLIENT_KEY,
    PATAVI_CLIENT_CRT,
    PATAVI_CA
  } = process.env;
  const oldCBMstate: IChoiceBasedMatchingState = request.body;
  const pataviTaskUrl = `https://${PATAVI_HOST}:${PATAVI_PORT}/task?service=smaa_v2&ttl=PT5M`;

  let httpsOptionsNoCa = {
    cert: fs.readFileSync(PATAVI_CLIENT_CRT!),
    key: fs.readFileSync(PATAVI_CLIENT_KEY!)
  };
  let ca;
  try {
    ca = fs.readFileSync(PATAVI_CA!);
  } catch (exception) {
    logger.warn('missing patavi CA certificate');
  }
  const httpsOptions = ca ? {...httpsOptionsNoCa, ca: ca} : httpsOptionsNoCa;
  const httpsAgent = new https.Agent({...httpsOptions, path: pataviTaskUrl});

  Axios.post(
    pataviTaskUrl,
    {...oldCBMstate, method: 'choiceBasedMatching'},
    {httpsAgent}
  )
    .then((pataviResponse: AxiosResponse) => {
      return handleUpdateResponse(response, pataviResponse);
    })
    .then((updatesUrl) => {
      const client = new WebSocketClient({
        tlsOptions: {...httpsOptions, path: updatesUrl}
      });
      client.on('connectFailed', _.partial(failedConnectionCallback, response));
      client.on(
        'connect',
        _.partial(successfulConnectionCallback, response, httpsAgent)
      );

      client.connect(updatesUrl);
    })
    .catch((error: AxiosError) => {
      errorHandler(response, 500, error.message);
    });
}

function handleUpdateResponse(
  response: Response,
  pataviResponse: AxiosResponse
) {
  if (
    pataviResponse.data &&
    pataviResponse.data._links &&
    pataviResponse.data._links.updates &&
    pataviResponse.data._links.updates.href &&
    pataviResponse.status === 201
  ) {
    return pataviResponse.data._links.updates.href;
  } else {
    errorHandler(
      response,
      pataviResponse.status,
      `Patavi server responded with ${pataviResponse.status}`
    );
  }
}

function failedConnectionCallback(response: Response, error: Error) {
  errorHandler(
    response,
    500,
    `Websocket connection to Patavi failed with error: ${error.message}`
  );
}

function successfulConnectionCallback(
  response: Response,
  httpsAgent: https.Agent,
  connection: connection
) {
  connection.on('message', (message: IMessage) => {
    if (message.utf8Data) {
      const data = JSON.parse(message.utf8Data);
      handleMessage(response, connection, httpsAgent, data);
    } else {
      errorHandler(response, 500, 'Malformed response from Patavi');
    }
  });
}

function handleMessage(
  response: Response,
  connection: connection,
  httpsAgent: https.Agent,
  messageData: {eventType: string; eventData: {href: string}}
) {
  if (messageData.eventType === 'done') {
    connection.close();
    Axios.get(messageData.eventData.href, {httpsAgent}).then(
      (resultsResponse: AxiosResponse<IChoiceBasedMatchingState>) => {
        response.json(resultsResponse.data);
      }
    );
  } else {
    errorHandler(
      response,
      500,
      `Patavi returned event type: ${messageData.eventType}`
    );
  }
}

function errorHandler(response: Response, status: number, message: string) {
  logger.error(message);
  response.status(status);
  response.send(message);
}
