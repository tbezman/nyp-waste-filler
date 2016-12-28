import {
    PDFService
} from '../../../back/PDFService';

class PDFLayoutController {
    constructor($stateParams, StorageService, DB_FIELD_MAP) {
        this.pdfService = new PDFService();

        if ($stateParams.files) {
            this.pdfService.files = $stateParams.files;
        }

        StorageService.watch(this.pdfService, 'pdf-layout', () => {
            return {
                files: this.pdfService.files
            }
        }, data => {
            if (this.pdfService.files.length < 1) {
                this.pdfService.files = data.files;
            }
        });

        this.dbColumns = DB_FIELD_MAP;
    }

    $onInit() {
        this.currentFile = this.pdfService.files[0];
        this.page = 1;

        this.pdfService.getDocument(this.currentFile)
            .then(pdf => {
                pdf.getPage(this.page).then(page => {
                    this.pdfService.renderToElement(page, '#canvas');
                })
            })
    }
}

import layout from './PDFLayout.html';

export const PDFLayoutComponent = {
    template: layout,

    controller: PDFLayoutController,
    controllerAs: 'layout'
}
