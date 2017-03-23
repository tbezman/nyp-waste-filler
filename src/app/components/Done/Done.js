import {PDFService} from '../../../back/PDFService';
import {BatchService} from '../../../back/BatchService';
import {ExportService} from '../../../back/ExportService';
import {VialService} from '../../../back/VialService';
let fs = require('fs');
let jsPDF = require('jspdf');
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

        this.initVials();

        PDFLog.readyLogs()
            .then(logs => {
                this.pdfLogs = logs;
                this.findUnhandledDrugs();
            })
    }

    initVials() {
        let vialService = new VialService();
        this.vials = vialService.vials;
    }

    findUnhandledDrugs() {
        this.pdfLogs.forEach(log => {
            let waste = log.waste_log;

            var found = false;
            this.unhandledDrugs.forEach(drug => {
                if (drug.drug == waste.charge_code_descriptor) found = true;
            });

            if (waste && !waste.vial && !found) {
                this.unhandledDrugs.push({drug: waste.charge_code_descriptor});
            }
        });

        this.$scope.$apply();
    }

    process() {
        this.SpinnerService.show();

        this.handleDrugMap();

        this.writeLogs()
    }

    handleDrugMap() {
        global.drugMap = this.unhandledDrugs;
    }

    backup() {
        let exportService = new ExportService();
        exportService.backup();
    }

    writeBatchFile(campus) {
        let batchService = new BatchService(this.pdfLogs);
        return batchService.save(campus);
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

            saveFile(this.writeBatchFile('east'), 'East Batch File.txt');
            saveFile(this.writeBatchFile('west'), 'West Batch File.txt');
        })
    }
}

import done from './Done.html';

export const DoneComponent = {
    template: done,

    controller: DoneController,
    controllerAs: 'done'
}
