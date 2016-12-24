import fs from 'fs';
import hummus from 'hummus';

export class PDFService {
	constructor(fileData) {
		this.fileData = fileData;
		this.files = [];
	}

	storeData() {
		return new Promise((resolve, reject) => {
			let savePromises = [];
			this.fileData.forEach(data => {
				savePromises.append(new Promise((saveResolve, reject) => {
					let buffer = new Buffer(data.split(',')[1], 'base64');

					fs.writeFile(appRoot + '/files/' + guid() + '.pdf', buffer, (err) => {
						if(!err) {
							saveResolve();
						}
					})
				}));
			});

			Promise.all(savePromises)
				.then(() => {
					resolve();
				});
		})
	}

	splitUp() {
		let writer = hummus.createWriter(appRoot + '/files/' + guid() + '.pdf');	

	}
}