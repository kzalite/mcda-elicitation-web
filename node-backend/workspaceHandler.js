'use strict';
var util = require('./util');
var logger = require('./logger');
var async = require('async');

module.exports = function(db) {
  var WorkspaceRepository = require('./workspaceRepository')(db);
  var SubProblemRepository = require('./subProblemRepository')(db);
  var ScenarioRepository = require('./scenarioRepository')(db);

  // Complete workspaces
  function query(request, response, next) {
    WorkspaceRepository.query(util.getUser(request).id, function(error, result) {
      if (error) {
        util.checkForError(error, next);
      } else {
        response.json(result.rows);
      }
    });
  }

  function create(request, response, next) {
    function workspaceTransaction(client, transactionCallback) {
      function createNewWorkspace(callback) {
        logger.debug('creating new workspace');

        var owner = util.getUser(request).id;
        var title = request.body.title;
        var problem = request.body.problem;
        WorkspaceRepository.create(owner, title, problem, callback);
      }

      function createSubProblem(result, callback) {
        logger.debug('creating subProblem');

        var definition = {
          ranges: util.getRanges(request.body.problem)
        };
        var workspaceId = result.rows[0].id;
        SubProblemRepository.create(
          workspaceId,
          'Default',
          definition,
          function(error, result) {
            util.checkForError(error, next);
            if (!error) {
              var subproblemId = result.rows[0].id;
              callback(null, workspaceId, subproblemId);
            }
          }
        );
        logger.debug('created definition ' + JSON.stringify(definition));
      }

      function setDefaultSubProblem(workspaceId, subproblemId, callback) {
        logger.debug('setting default subProblem');
        WorkspaceRepository.setDefaultSubProblem(workspaceId, subproblemId, function(error) {
          if (error) {
            util.checkForError(error, next);
          } else {
            callback(null, workspaceId, subproblemId);
          }
        });
      }

      function createScenario(workspaceId, subproblemId, callback) {
        logger.debug('creating scenario');
        var state = {
          problem: util.reduceProblem(request.body.problem)
        };
        ScenarioRepository.create(
          workspaceId,
          subproblemId,
          'Default',
          state,
          function(error, result) {
            if (error) {
              util.checkForError(error, next);
            } else {
              var scenarioId = result.rows[0].id;
              callback(null, workspaceId, scenarioId);
            }
          }
        );
      }

      function setDefaultScenario(workspaceId, subproblemId, callback) {
        logger.debug('setting default scenario');
        WorkspaceRepository.setDefaultScenario(workspaceId, subproblemId, function(error) {
          if (error) {
            util.checkForError(error, next);
          } else {
            callback(null, workspaceId);
          }
        });
      }

      async.waterfall([
        createNewWorkspace,
        createSubProblem,
        setDefaultSubProblem,
        createScenario,
        setDefaultScenario,
        WorkspaceRepository.getWorkspaceInfo
      ], transactionCallback);
    }

    db.runInTransaction(workspaceTransaction, function(error, result) {
      if (error) {
        util.checkForError(error, next);
      } else {
        response.json(result.rows[0]);
      }
    });
  }

  function get(req, response, next) {
    WorkspaceRepository.get(req.params.id, function(error, result) {
      if (error) {
        util.checkForError(error, next);
      } else {
        response.json(result.rows[0]);
      }
    });
  }

  function update(req, response, next) {
    WorkspaceRepository.update(
      req.body.problem.title,
      req.body.problem,
      req.params.id,
      function(error) {
        if (error) {
          util.checkForError(error, next);
        } else {
          response.end();
        }
      });
  }

  function del(req, response, next) {
    WorkspaceRepository.delete(req.params.id, function(error) {
      if (error){
        util.checkForError(error, next);
      } else {
        response.end();
      }
    });
  }

  return {
    query: query,
    create: create,
    get: get,
    update: update,
    delete: del
  };
};
