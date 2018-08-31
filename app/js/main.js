'use strict';
define(['angular',
  'mcdaweb',
  'css/mcda-drugis.css',
  'font-awesome/css/font-awesome.min.css',
  'nvd3/build/nv.d3.css',
  'angularjs-slider/dist/rzslider.css',
  'c3/c3.css'
], function() {
  window.patavi = { 'WS_URI': 'wss://patavi.drugis.org/ws' };

  window.config = {
    WS_URI: 'wss://patavi.drugis.org/ws',
    examplesRepository: 'examples/',
    workspacesRepositoryUrl: '/workspaces/',
  };
});
