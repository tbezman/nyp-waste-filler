export class SpinnerService {
    constructor($rootScope) {
        this.spinning = false;
        this.$rootScope = $rootScope;
    }

    updateSpinner() {
        if (this.spinning)
            this.$rootScope.$broadcast('spinner.show');
        else
            this.$rootScope.$broadcast('spinner.hide');
    }

    toggle() {
        this.spinning = !this.spinning;
        this.updateSpinner();
    }

    show() {
        this.spinning = true;
        this.updateSpinner();
    }

    hide() {
        this.spinning = false;
        this.updateSpinner();
    }
}
