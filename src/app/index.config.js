import angular from 'angular';

angular.module('app.config', [require('angular-ui-router')])
	.config(($stateProvider, $urlRouterProvider) => {
		$stateProvider.state({
			url: "/",
			name: "home",
			template: "<home></home>"
		})
		$stateProvider.state({
			name: 'waste-upload',
			url: '/waste-upload',
			template: '<waste-upload></waste-upload>'
		});
		$stateProvider.state({
			name: 'pdf-upload',
			url: '/pdf-upload',
			template: '<pdf-upload></pdf-upload>'
		})
		$urlRouterProvider.otherwise('/');
	});