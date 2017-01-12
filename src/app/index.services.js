import {StorageService} from './services/StorageService';
import {SpinnerService} from './services/SpinnerService';
import {CampusService} from './services/CampusService';

angular.module('app.services', [])
	.service('StorageService', StorageService)
	.service('CampusService', CampusService)
	.service('SpinnerService', SpinnerService);
