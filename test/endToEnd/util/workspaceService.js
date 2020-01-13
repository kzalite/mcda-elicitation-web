'use strict';

const errorService = require('./errorService.js');
const util = require('./util.js');

function goHomeAfterLoading(browser, title) {
  errorService.isErrorBarHidden(browser)
    .assert.containsText('#workspace-title', title);
  util.delayedClick(browser, '#logo', '#workspaces-header')
    .waitForElementVisible('#workspaces-header');
}

function addExample(browser, title) {
  browser
    .waitForElementVisible('#create-workspace-button')
    .click('#create-workspace-button')
    .click('#example-workspace-radio')
    .click('#example-workspace-selector')
    .click('option[label="' + title + '"]')
    .click('#add-workspace-button').pause(500);
  goHomeAfterLoading(browser, title);
  return browser;
}

function addTutorial(browser, title) {
  browser
    .waitForElementVisible('#create-workspace-button')
    .click('#create-workspace-button')
    .click('#tutorial-workspace-radio')
    .click('#tutorial-workspace-selector')
    .click('option[label="' + title + '"]')
    .click('#add-workspace-button').pause(500);
  goHomeAfterLoading(browser, title);
}

function copy(browser, index, newTitle) {
  return browser
    .click('#copy-workspace-' + index)
    .setValue('#workspace-title', newTitle);
}

function deleteFromList(browser, index) {
  browser
    .click('#delete-workspace-' + index)
    .click('#delete-workspace-confirm-button');
  errorService.isErrorBarHidden(browser);
}

function uploadTestWorkspace(browser, path) {
  browser
    .waitForElementVisible('#create-workspace-button')
    .click('#create-workspace-button')
    .click('#upload-workspace-radio')
    .setValue('#workspace-upload-input', require('path').resolve(__dirname + path))
    .click('#add-workspace-button').pause(500);
  errorService.isErrorBarHidden(browser);
}

function deleteUnfinishedFromList(browser, index) {
  browser
    .click('#delete-in-progress-workspace-' + index)
    .click('#delete-workspace-confirm-button');
  errorService.isErrorBarHidden(browser);
}

module.exports = {
  addExample: addExample,
  addTutorial: addTutorial,
  copy: copy,
  deleteFromList: deleteFromList,
  deleteUnfinishedFromList: deleteUnfinishedFromList,
  uploadTestWorkspace: uploadTestWorkspace,
  goHomeAfterLoading: goHomeAfterLoading
};
