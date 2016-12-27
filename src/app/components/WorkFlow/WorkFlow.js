class WorkFlowController {
    constructor($state, $rootScope) {
        this.$state = $state;
        this.$rootScope = $rootScope;
    }

    notHome() {
        return this.$state.current.name !== 'home';
    }

    back() {
        this.$rootScope.$emit('flowBack');
    }

	$onInit() {

	}
}

import flow from './WorkFlow.html';

export const WorkFlowComponent = {
	template: flow,

	controller: WorkFlowController	,
	controllerAs: 'flow'
}
