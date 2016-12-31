import hummus from 'hummus';
import {PDFService} from '../../../back/PDFService';
let fs = require('fs');
let jsPDF = require('jsPDF');
let moment = require('moment');

class DoneController {
    constructor($stateParams, StorageService) {
        this.layout = $stateParams.layout;
        this.pdfService = new PDFService();
        this.readerCache = {};

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
                return this.pdfLogs = logs;
            })
            .then(logs => {
                this.writeLogs()
            });
    }

    readerForFile(file) {
        if (!this.readerCache.hasOwnProperty(file)) {
            this.readerCache[file] = hummus.createReader(file);
        }

        return this.readerCache[file];
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
            resolve();
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

    writeLogs() {
        let wholePDF = new jsPDF();
        let finishedCount = 1;
        let addedPage = false;
        this.pdfLogs.forEach(log => {
            PDFJS.getDocument(log.file).then(pdf => {
                pdf.getPage(log.page).then(page => {
                    let canvas = document.createElement('canvas');
                    canvas.width = 800;
                    canvas.height = 1200;
                    this.pdfService.renderToElement(page, canvas).then(context => {
                        let canvasContext = context.canvasContext;
                        this.writeToLog(log, canvas, context, addedPage ? wholePDF.addPage() : wholePDF);

                        if (!addedPage) {
                            addedPage = true
                        }

                        finishedCount++;

                        console.log("Finished " + finishedCount)

                        if(finishedCount == this.pdfLogs.length) {
                            this.writeCSV(this.pdfLogs).then(() => {
                                wholePDF.save(appRoot + '/files/done.pdf');
                            });
                        }
                    });
                });
            });
        });
    }
}

import done from './Done.html';

export const DoneComponent = {
    template: done,

    controller: DoneController,
    controllerAs: 'done'
}
