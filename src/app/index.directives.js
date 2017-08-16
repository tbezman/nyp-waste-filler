let directives = angular.module('app.directives', []);

directives.directive('ngEnter', () => {
    return function (scope, element, attrs) {
        console.log('binding');
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});

export default directives;
