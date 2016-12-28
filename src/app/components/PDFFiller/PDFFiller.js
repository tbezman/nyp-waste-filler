import {
    PDFService
} from '../../../back/PDFService';

class PDFFillerController {
    constructor($stateParams, StorageService) {
        this.pdfService = new PDFService();
        this.layout = $stateParams.layout;

        if($stateParams.files) {
            this.pdfService.files = $stateParams.files;
        }

        StorageService.watch(this, 'pdf-filler', () => {
            return {
                files: this.pdfService.files,
                layout: this.layout
            }
        }, data => {
            if (!$stateParams.files) {
                this.pdfService.files = data.files;
            }

            this.layout = data.layout || {};

            this.$onInit();
        })
    }

    setPage(file, page) {
        this.pdfService.getDocument(file).then(pdf => {
            pdf.getPage(page).then(page => {
                this.pdfService.renderToElement(page, '#canvas');
            });
        })
    }

    $onInit() {
        this.currentFile = this.pdfService.files[0];
        this.page = 1;

        this.setPage(this.currentFile, this.page);
    }
}

import filler from './PDFFiller.html';

export const PDFFillerComponent = {
    template: filler,

    controller: PDFFillerController,
    controllerAs: 'filler',
}
