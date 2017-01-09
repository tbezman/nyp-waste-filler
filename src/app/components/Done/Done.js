import hummus from 'hummus';
import {PDFService} from '../../../back/PDFService';
import {ExportService} from '../../../back/ExportService';
let fs = require('fs');
let jsPDF = require('jsPDF');
let moment = require('moment');

class DoneController {
    constructor($stateParams, StorageService, $scope, SpinnerService) {
        this.$scope = $scope;
        this.SpinnerService = SpinnerService;

        this.layout = $stateParams.layout;
        this.pdfService = new PDFService();
        this.unhandledDrugs = [];

        this.pdfWorkerCache = {};

        StorageService.watch(this, 'done', () => {
            return {
                layout: this.layout
            }
        }, data => {
            if (!this.layout) {
                this.layout = data.layout;
            }
        });

        PDFLog.findAll({
                include: [WasteLog]
            })
            .then(logs => {
                this.pdfLogs = logs.filter(log => !log.problematic && log.waste_log);

                this.findUnhandledDrugs();
            })
    }

    findUnhandledDrugs() {
        this.pdfLogs.forEach(log => {
            let waste = log.waste_log;

            if (waste && !waste.vial && this.unhandledDrugs.indexOf(waste.charge_code_descriptor) == -1) {
                this.unhandledDrugs.push(waste.charge_code_descriptor);
            }
        });

        this.$scope.$apply();
    }

    process() {
        this.SpinnerService.show();

        this.writeLogs()
    }

    backup() {
        let exportService = new ExportService();
        exportService.backup();
    }

    readerForFile(file) {
        if (!this.readerCache.hasOwnProperty(file)) {
            this.readerCache[file] = hummus.createReader(file);
        }

        return this.readerCache[file];
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

    writeBatchFile(logs) {
        let filePath = appRoot + '/files/' + guid() + '.txt';
        logs.forEach(log => {
            let waste = log.waste_log;
            console.log(waste.wasted_units);

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

            fs.appendFileSync(filePath, line + '\r\n', 'utf-8');
        });

        return filePath;
    }

    writeCSV(logs) {
        let fields = {
            'account_number': 'Account Number',
            'charge_code': 'Charge Code',
            'wasted_units': 'Wasted Units',
            'rate': 'Rate'
        };

        return new Promise((resolve, reject) => {
            let fileName = appRoot + '/files/' + guid() + '.csv';
            var badCount = 0;
            fs.appendFileSync(fileName, 'Date,' + Object.keys(fields).map(key => fields[key]).join(',') + '\n', 'utf-8');

            logs.forEach(log => {
                let wasteLog = log.waste_log;

                if (wasteLog && !log.problematic) {
                    let line = moment(wasteLog.when).format('MM/DD/YYYY') + ',' + Object.keys(fields).map(key => {
                        return wasteLog[key]
                    }).join(',') + '\n';

                    fs.appendFileSync(fileName, line, 'utf-8');
                } else {
                    badCount++;
                }
            });

            console.log('Bad: ' + badCount);
            resolve(fileName);
        });
    }

    writeToLog(log, canvas, pdfContext, pdf) {
        let context = canvas.getContext('2d');
        let viewport = pdfContext.viewport;
        for (var field in this.layout) {
            let positions = this.layout[field];

            if (log.waste_log) {
                var data = log.waste_log[field];

                if (PREFIX_MAP.hasOwnProperty(field)) {
                    data = PREFIX_MAP[field] + data;
                }

                positions.forEach(position => {
                    context.font = "20px Roboto";
                    context.fillText(data, position.x * viewport.width, position.y * viewport.height);
                });
            }
        }

        let imageData = canvas.toDataURL('image/jpeg');
        pdf.addImage(imageData, 'JPEG', 0, 0);
    }

    writePage(log, page, wholePDF, addedPage) {
        console.log(addedPage);
        let canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 1200;

        return new Promise((resolve, reject) => {
            this.pdfService.renderToElement(page, canvas).then(context => {
                let canvasContext = context.canvasContext;
                this.writeToLog(log, canvas, context, addedPage ? wholePDF.addPage() : wholePDF);

                resolve();
            });
        });
    }

    writeLogs() {
        let wholePDF = new jsPDF();
        let addedPage = false;
        let finishedCount = 1;
        let logMap = {};

        this.pdfLogs.forEach(log => {
            let file = log.file;
            let logsWithThisFile = this.pdfLogs.filter(log => log.file == file);
            logMap[file] = logsWithThisFile;
        });

        var promise = Promise.resolve()

        for (var file in logMap) {
            promise = promise.then(() => {
                return new Promise((resolve, reject) => {
                    let logs = logMap[file];

                    PDFJS.getDocument(file).then(pdf => {
                        let logPromises = [];
                        logs.forEach(log => {
                            logPromises.push(new Promise((logResolve) => {
                                pdf.getPage(log.page).then(page => {
                                    this.writePage(log, page, wholePDF, addedPage)
                                        .then(() => {
                                            logResolve();
                                        });

                                    addedPage = true;
                                })
                            }));
                        });

                        Promise.all(logPromises).then(() => {
                            console.log('finished whole file : ' + file);
                            pdf.destroy();
                            resolve();
                        });
                    })
                })
            });
        }

        promise.then(() => {
            this.SpinnerService.hide();
            wholePDF.save();

            this.writeCSV(this.pdfLogs)
                .then(path => {
                    saveFile(path, 'Waste Records.csv');
                });

            saveFile(this.writeBatchFile(this.pdfLogs), 'Batch File.txt');
        })
    }
}

import done from './Done.html';

export const DoneComponent = {
    template: done,

    controller: DoneController,
    controllerAs: 'done'
}
