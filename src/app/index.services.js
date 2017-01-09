import {StorageService} from './services/StorageService';
import {SpinnerService} from './services/SpinnerService';

angular.module('app.services', [])
	.service('StorageService', StorageService)
	.service('SpinnerService', SpinnerService);
