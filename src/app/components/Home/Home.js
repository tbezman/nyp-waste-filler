class HomeController {

	$onInit() {
		this.hello = "world";
	}
}

import home from './Home.html';

export const HomeComponent = {
	template: home,

	controller: HomeController	,
	controllerAs: 'home'
}