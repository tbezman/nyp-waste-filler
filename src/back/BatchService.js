import moment from 'moment';
import fs from 'fs';
export class BatchService {
    constructor(logs) {
        console.log('in const');
        this.logs = logs.filter(log => {
            return !!log.waste_log.vial && log.waste_log.wasted_units > 0;
        });
    }

    westLine(log) {
        let waste = log.waste_log;
        var line = this.appendSpaces("1", 14);

        line += this.padNumber(waste.mrn, 7);
        line = this.appendSpaces(line, 12);
        line = line + waste.charge_code;
        line = line + moment(waste.when).format('MMDDYY');
        line = line + this.cobolFormat(5, 2, waste.rate);
        line = line + this.cobolFormat(3, 2, waste.wasted_units);
        line = line + "+";
        line = this.appendSpaces(line, 34);
        line = line + this.padNumberWith(' ', waste.account_number, 12);
        line += " JW";

        return line;
    }

    eastLine(log, index) {
        let waste = log.waste_log;
        var line = this.padNumber((index + 1) + "", 7);

        line += moment().format('YYMMDD').toString();
        line += moment().format('HHmmss').toString();
        line += "INIT  "; //Default
        line += 'HCHG01NYA';
        line = this.appendSpaces(line, 11);
        line = line + this.padNumberWith(' ', waste.patient_number, 15, true);
        line += "O";
        line += this.padNumberWith(' ', waste.account_number, 9, true);
        line = this.appendSpaces(line, 6);
        line += moment(waste.when).format('MM/DD/YY');
        line += this.padNumber(waste.charge_code, 8);
        line += this.decimalFormat(5, 2, waste.rate) + " ";
        line += this.decimalFormat(3, 2, waste.units) + ' ';
        line += 'HO';
        line += 'HCPCS:      M1:   M2:JW M3:   M4:   NDC:' + this.padNumberWith(' ', waste.vial.ndc, 12, true);
        line += "                         AI        W WS PP0001000300 S";
        line = this.appendSpaces(line, 756 - line.length);

        line = line.substr(0, 402) + 'AW' + line.substr(404);

        return line;
    }

    data(campus) {
        return this.logs.map((log, index) => this[campus + 'Line'](log, index)
        ).join('\r\n');
    }

    save(campus) {
        console.log('in save');
        let data = this.data(campus);
        console.log(data);
        let filePath = appRoot + '/files/' + guid() + '.txt';
        console.log(filePath);

        fs.appendFileSync(filePath, data, 'utf-8');

        return filePath;
    }

    appendSpaces(string, length) {
        return this.appendChars(' ', string, length);
    }

    appendChars(char, string, length) {
        for (var i = 0; i < length; i++) {
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

    padNumberWith(char, num, length, after) {
        let string = num.toString();
        let extra = this.appendChars(char, "", length - string.length);

        if (after)
            return string + extra;

        return extra + string;
    }

    getDecimalOfNumber(num) {
        return parseInt((num - parseInt(num)) * 100);
    }

    decimalFormat(intLength, decLength, num) {
        let int = parseInt(num);
        let dec = this.getDecimalOfNumber(num);

        return (this.padNumber(int, intLength) + "." + this.padNumber(dec, 2)).toString();
    }

    cobolFormat(intLength, decLength, num) {
        let int = parseInt(num);
        let dec = this.getDecimalOfNumber(num);

        return this.padNumber(int, intLength) + this.padNumber(dec, 2);
    }

}
