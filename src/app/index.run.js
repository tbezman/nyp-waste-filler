let angular = require('angular');

angular.module('app.run', [])
	.run(($rootScope, StorageService, $state) => {
        let states = $state.get().filter(state => {
            return state.parent && state.parent == 'work';
        }).map(state => state.name);

        console.log(states);

		$rootScope.$on('$stateChangeStart', event => {
			StorageService.updateAll();
		});

        $rootScope.$on('flowBack', () => {
            let index = states.indexOf($state.current.name);

            if(index > 0) {
                index--;
                $state.go(states[index]);
            }
        });
	});
