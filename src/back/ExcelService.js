import fs from 'fs';
var Excel = require('exceljs');
let moment = require('moment');

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
					console.log(this.workbook.worksheets);
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

	process(columnMap) {
		var columns = this.getColumns();
		columns = this.invert(columns);

		let rows = [];
		this.worksheet.eachRow((row, rowNumber) => {
			let wasteRecord = {};
			let values = row.values;
			Object.keys(DB_FIELD_MAP).forEach(key => {
				wasteRecord[key] = values[columns[columnMap[key]]];
			});

			let justDate = moment.utc(wasteRecord.date);
			wasteRecord.when = moment(justDate.format('M/D/YYYY') + ' ' + wasteRecord.time, 'M/D/YYYY h:mma');

			delete wasteRecord.date;
			delete wasteRecord.time;

			rows.push(wasteRecord);
		});

		return WasteLog.bulkCreate(rows.slice(1));
	}

	invert(map) {
		let ret = {}
		for (var key in map) {
			let val = map[key];
			ret[val] = key;
		}
		return ret;
	}
}
