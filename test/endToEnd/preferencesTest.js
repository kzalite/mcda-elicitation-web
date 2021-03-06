'use strict';

module.exports = {
  beforeEach: beforeEach,
  afterEach: afterEach,
  'Setting the weights through ranking': ranking,
  'Ranking previous button': rankingGoBack,
  'Matching previous button': matchingGoBack,
  'Setting the weights through precise swing weighting': preciseSwing,
  'Precise swing previous button': preciseSwingGoBack,
  'Setting the weights through imprecise swing weighting': impreciseSwing,
  'Imprecise swing previous button': impreciseSwingGoBack,
  'Interacting with Willingness to trade off plot': interactWithPlot
};

const loginService = require('./util/loginService');
const workspaceService = require('./util/workspaceService');
const errorService = require('./util/errorService');

function loadTestWorkspace(browser) {
  workspaceService.addExample(browser, 'GetReal course LU 4, activity 4.4')
    .click('#workspace-0')
    .waitForElementVisible('#workspace-title');

  errorService.isErrorBarHidden(browser)
    .click('#preferences-tab')
    .waitForElementVisible('#partial-value-functions-block');
}

function resetWeights(browser) {
  browser
    .click('#reset-button')
    .assert.containsText('#importance-criterion-0', '?')
    .assert.containsText('#importance-criterion-1', '?')
    .assert.containsText('#importance-criterion-2', '?')
    ;
}

function matchImportanceColumnContents(browser, value1, value2, value3) {
  browser
    .waitForElementVisible('#trade-off-block')
    .assert.containsText('#importance-criterion-0', value1)
    .assert.containsText('#importance-criterion-1', value2)
    .assert.containsText('#importance-criterion-2', value3)
    ;
}

function beforeEach(browser) {
  loginService.login(browser);
  workspaceService.cleanList(browser);
  loadTestWorkspace(browser);
}

function afterEach(browser) {
  browser.click('#logo');
  workspaceService
    .deleteFromList(browser, 0)
    .end();
}

function ranking(browser) {
  browser
    .click('#ranking-button')
    .waitForElementVisible('#ranking-title-header')
    .click('#ranking-option-0')
    .click('#next-button')
    .click('#ranking-option-0')
    .click('#save-button');

  matchImportanceColumnContents(browser, 1, 2, 3);
  resetWeights(browser);
}

function rankingGoBack(browser) {
  browser
    .click('#ranking-button')
    .waitForElementVisible('#ranking-title-header')
    .click('#ranking-option-0')
    .click('#next-button')
    .click('#previous-button')
    .assert.containsText('#ranking-title-header', 'Ranking (1/2)');
}

function matchingGoBack(browser) {
  browser
    .click('#matching-button')
    .waitForElementVisible('#matching-title-header')
    .click('#matching-option-0')
    .click('#next-button')
    .click('#previous-button')
    .assert.containsText('#matching-title-header', 'Matching (1/2)');
}

function preciseSwing(browser) {
  browser
    .click('#precise-swing-button')
    .waitForElementVisible('#swing-weighting-title-header')
    .click('#swing-option-0')
    .click('#next-button')
    .click('#save-button');

  matchImportanceColumnContents(browser, '100%', '100%', '100%');
  resetWeights(browser);
}

function preciseSwingGoBack(browser) {
  browser
    .click('#precise-swing-button')
    .waitForElementVisible('#swing-weighting-title-header')
    .click('#swing-option-0')
    .click('#next-button')
    .click('#previous-button')
    .assert.containsText('#swing-weighting-title-header', 'Precise swing weighting (1/2)');
}

function impreciseSwing(browser) {
  browser
    .click('#imprecise-swing-button')
    .waitForElementVisible('#swing-weighting-title-header')
    .click('#swing-option-0')
    .click('#next-button')
    .click('#save-button');

  matchImportanceColumnContents(browser, '100%', '1-100%', '1-100%');
  resetWeights(browser);
}

function impreciseSwingGoBack(browser) {
  browser
    .click('#imprecise-swing-button')
    .waitForElementVisible('#swing-weighting-title-header')
    .click('#swing-option-0')
    .click('#next-button')
    .click('#previous-button')
    .assert.containsText('#swing-weighting-title-header', 'Imprecise swing weighting (1/2)');
}

function interactWithPlot(browser) {
  const outcomeValue = 60;

  browser.expect.element('#first-criterion-outcome-input').to.not.have.value.which.contains('.');
  browser.expect.element('#second-criterion-outcome-input').to.not.have.value.which.contains('.');
  browser
    .useXpath()
    .waitForElementVisible('//willingness-to-trade-off-chart/div/div[1]/div')
    .getLocationInView('//willingness-to-trade-off-chart/div/div[1]/div')
    .moveToElement('//willingness-to-trade-off-chart/div/div[1]/div', 180, 170)
    .mouseButtonDown(0)
    .mouseButtonUp(0)
    .useCss();

  browser.expect.element('#first-criterion-outcome-input').to.have.value.which.contains('.');
  browser.expect.element('#second-criterion-outcome-input').to.have.value.which.contains('.');

  browser
    .waitForElementVisible('#first-criterion-outcome-b-input')
    .waitForElementVisible('#second-criterion-outcome-b-input')
    .waitForElementVisible('#willingness-summary')
    .waitForElementVisible('#willingness-slider')
    .clearValue('#first-criterion-outcome-b-input')
    .setValue('#first-criterion-outcome-b-input', outcomeValue)
    .pause(500)
    .useXpath()
    .assert.containsText('//willingness-to-trade-off-chart/div/div[2]/div/span[10]', outcomeValue)
    .useCss();
}
