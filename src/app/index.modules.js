import angular from 'angular';

export default angular.module('app', ['app.components', 'app.config', 'app.services', 'app.run', 'app.constants', require('angular-ui-router'), require('angular-animate')]);

import './index.components';
import './index.services';
import './index.config';
import './index.run';
import './index.constants';
