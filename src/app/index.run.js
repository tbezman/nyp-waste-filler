let angular = require('angular');

angular.module('app.run', [])
	.run(($rootScope, StorageService, $state) => {
        let stateHistory = [];


		$rootScope.$on('$stateChangeStart', event => {
			StorageService.updateAll();
		});

		$rootScope.$on('$stateChangeSuccess', (event, toState) => {
	        stateHistory.push(toState.name);
        })

        $rootScope.$on('flowBack', () => {
            if(stateHistory.length >= 2) {
                let last = stateHistory[stateHistory.length - 2];
                $state.go(last)
            }
        });
	});
