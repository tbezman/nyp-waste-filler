let angular = require('angular');

angular.module('app.config', [require('angular-ui-router')])
    .config(($stateProvider, $urlRouterProvider) => {
        $stateProvider.state({
            name: 'work',
            template: '<work-flow></work-flow>'
        });
        $stateProvider.state({
            url: "/",
            name: "home",
            parent: 'work',
            template: "<home></home>"
        })
        $stateProvider.state({
            name: 'waste-upload',
            url: '/waste-upload',
            parent: 'work',
            template: '<waste-upload></waste-upload>'
        });
        $stateProvider.state({
            name: 'pdf-upload',
            url: '/pdf-upload',
            parent: 'work',
            template: '<pdf-upload></pdf-upload>'
        })
        $stateProvider.state({
            name: 'pdf-layout',
            url: '/pdf-layout',
            params: {
                files: null
            },
            parent: 'work',
            template: '<pdf-layout></pdf-layout>'
        })
        $urlRouterProvider.otherwise('/');
    });
