import angular from 'angular';

import 'ng-mask';

export default angular.module('app', ['app.components', 'app.config', 'app.services', 'app.run', 'app.constants', 'app.directives', require('angular-ui-router'), require('angular-animate'), 'ngMask']);

import './index.components';
import './index.directives';
import './index.services';
import './index.config';
import './index.run';
import './index.constants';
