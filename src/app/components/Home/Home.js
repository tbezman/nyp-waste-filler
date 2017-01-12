class HomeController {
	constructor(CampusService, $scope) {
		this.CampusService = CampusService;	
		this.CampusService.read().then(() => {
			$scope.$apply();
		});
	}

	campusChange() {
		this.CampusService.campus = this.campus;
	}
}

import home from './Home.html';

export const HomeComponent = {
	template: home,

	controller: HomeController	,
	controllerAs: 'home'
}