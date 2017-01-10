import moment from 'moment';
import fs from 'fs';
export class BatchService {
	constructor(logs) {
		this.logs = logs.filter(log => {
			return log.waste_log.wasted_units > 0;
		});
	}

	westLine(log) {
		let waste = log.waste_log;
		var line = this.appendSpaces("1", 14);

		line += this.padNumber(waste.patient_number, 7);
		line = this.appendSpaces(line, 12);
		line = line + waste.charge_code;
		line = line + moment(waste.when).format('MMDDYY');
		line = line + this.cobolFormat(5, 2, waste.rate);
		line = line + this.cobolFormat(3, 2, waste.wasted_units);
		line = line + "+"
		line = this.appendSpaces(line, 34);
		line = line + this.padNumberWith(' ', waste.account_number, 12);
		line += " udjw";

		return line;
	}

	data(campus) {
		return this.logs.map(log => this[campus + 'Line'](log)).join('\r\n');
	}

	save(campus) {
		let data = this.data(campus);
		let filePath = appRoot + '/files/' + guid() + '.txt';

		fs.appendFileSync(filePath, data, 'utf-8');

		return filePath;
	}

	appendSpaces(string, length) {
		return this.appendChars(' ', string, length);
	}

	appendChars(char, string, length) {
		for(var i = 0; i < length; i++) {
			string = string + char;
		}

		return string;
	}

	padNumber(num, length) {
		return this.padNumberWith('0', num, length, false);
	}

	padNumberAfter(num, length) {
		return this.padNumberWith('0', num, length, true);
	}

	padNumberWith(char, num, length, after = false) {
		let string = num.toString();
		let extra = this.appendChars(char, "", length - string.length);

		if(after)
			return string + extra;

		return extra + string;
	}

	getDecimalOfNumber(num) {
		return parseInt((num - parseInt(num)) * 100);
	}

	cobolFormat(intLength, decLength, num) {
		let int = parseInt(num);
		let dec = this.getDecimalOfNumber(num);

		return this.padNumber(int, intLength) + this.padNumber(dec, 2);
	}

}