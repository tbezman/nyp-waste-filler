import {
    PDFService
} from '../../../back/PDFService';

class PDFUploadController {
    constructor(StorageService, $state) {
        this.pdfService = new PDFService();
		this.pdfsReady = false;
		this.$state = $state;

        StorageService.watch(this.files, 'pdf-upload', () => {
            return {
                files: this.pdfService.files
            }
        }, data => {
            this.pdfService.files = data.files;

			if(data.files.length > 0) {
				this.pdfsReady = true;
			}
        });
    }

	fileCount() {
		return this.pdfService.files.length;
	}

    onFileLoad(event) {
        let result = event.target.result;
        this.pdfService.addFile(result);
    }

    selectFiles() {
        document.querySelector('#fakeInputMultiple').click();
    }

	next() {
		this.$state.go('pdf-layout', {files: this.pdfService.files});
	}

    $onInit() {
        this.fileReader = new FileReader();

        this.fileReader.onload = (event) => {
            this.onFileLoad(event);
        };

        angular.element(document.querySelector('#fakeInputMultiple')).bind('change', event => {
            for (var i = 0; i < event.target.files.length; i++) {
                this.fileReader.readAsDataURL(event.target.files[i]);
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
