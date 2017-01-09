let angular = require('angular');

angular.module('app.run', [])
	.run(($rootScope, StorageService, $state) => {
		var last = null;

        let states = $state.get().filter(state => {
            return state.parent && state.parent == 'work';
        }).map(state => state.name);

		$rootScope.$on('$stateChangeStart', event => {
			StorageService.updateAll();
		});

		$rootScope.$on('$stateChangeSuccess', (event, to, params, from) => {
			last = from.name;
		});

        $rootScope.$on('flowBack', () => {
            let index = states.indexOf($state.current.name);

			if($state.current.name == "vial-config") {
				$state.go(last || 'home');
				return;
			}

            if(index > 0) {
                index--;
                $state.go(states[index]);
            }
        });
	});
