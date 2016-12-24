import {PDFService} from '../../../back/PDFService';

class PDFUploadController {
	constructor() {
	}

	onFileLoad(event) {
		this.pdfService = new PDFService(event.target.files.map(file => file.result));	
	}

	selectFiles() {
		document.querySelector('#fakeInputMultiple').click();
	}

	$onInit() {
		this.fileReader = new FileReader();

		this.fileReader.onload = (event) => { this.onFileLoad(event) };

		angular.element(document.querySelector('#fakeInputMultiple')).bind('change', event => {
			this.fileReader.readAsDataURL(event.target.files[0]);
		});
	}
}

import pdf from './PDFUpload.html';

export const PDFUploadComponent = {
	template: pdf,

	controller: PDFUploadController	,
	controllerAs: 'pdf'
}