import fs from 'fs';
var Excel = require('exceljs');

export class ExcelService {
	constructor(data) {
		this.data = data ? data.toString() : null;
	}

	getColumns() {
		return this.worksheet.getRow(1).values;
	}

	readData() {
		return new Promise((resolve, reject) => {
			this.workbook = new Excel.Workbook();
			this.workbook.xlsx.readFile(this.filePath)
				.then(() => {
					this.worksheet = this.workbook.worksheets[0];
					resolve();
				});
		});
	}

	saveData() {
		let data = this.data.split(',')[1];
		let buffer = new Buffer(data, 'base64');	

		this.filePath = appRoot + '/files/' + guid() + '.xlsx';

		fs.writeFileSync(this.filePath, buffer);

		return this.readData();
	}
}