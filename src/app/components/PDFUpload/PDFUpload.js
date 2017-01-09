import {
    PDFService
} from '../../../back/PDFService';

class PDFUploadController {
    constructor(StorageService, $state, $scope, $timeout, SpinnerService) {
        this.pdfService = new PDFService();
        this.pdfsReady = false;
        this.$state = $state;
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.SpinnerService = SpinnerService;
        this.fileCount = 0;

        StorageService.watch(this.files, 'pdf-upload', () => {
            return {
                files: this.pdfService.files
            }
        }, data => {
            this.pdfService.files = data.files;

            if (data.files.length > 0) {
                this.fileCount = data.files.length;
                this.pdfsReady = true;
            }
        });
    }

    onFileLoad(event, totalFileCount) {
        let result = event.target.result;
        let promise = this.pdfService.addFile(result);
        this.pdfsReady = true;
        this.fileCount++;

        promise.then(() => {
            this.$scope.$apply();

            if(this.fileCount == totalFileCount) {
                this.SpinnerService.hide();
            }
        });
    }

    selectFiles() {
        document.querySelector('#fakeInputMultiple').click();
    }

    resetFiles() {
        this.fileCount = 0;
        this.pdfsReady = false;

        this.pdfService.resetFiles();
    }

    next() {
        this.$state.go('pdf-layout', {
            files: this.pdfService.files
        });
    }

    $onInit() {
        angular.element(document.querySelector('#fakeInputMultiple')).bind('change', event => {
            this.SpinnerService.show();

            let length = event.target.files.length;
            for (var i = 0; i < length; i++) {
                let fileReader = new FileReader();

                fileReader.onload = (event) => {
                    this.onFileLoad(event, length);
                };

                fileReader.readAsDataURL(event.target.files[i]);
            }
        });
    }
}

import pdf from './PDFUpload.html';

export const PDFUploadComponent = {
    template: pdf,

    controller: PDFUploadController,
    controllerAs: 'pdf'
}
