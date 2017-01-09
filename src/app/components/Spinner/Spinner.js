class SpinnerController {
        constructor($rootScope) {
            this.show = false;
            this.$rootScope = $rootScope;
        }

        $onInit() {
            this.$rootScope.$on('spinner.show', () => {
                this.show = true;
            });

            this.$rootScope.$on('spinner.hide', () => {
                this.show = false;
            });
        }
}

import spinner from './Spinner.html';

export const SpinnerComponent = {
	template: spinner,

	controller: SpinnerController	,
	controllerAs: 'spinner'
}
