let angular = require('angular');

angular.module('app.run', [])
	.run(($rootScope, StorageService) => {
		$rootScope.$on('$stateChangeStart', event => {
			StorageService.updateAll();
		});
	});
