import hummus from 'hummus';
import {PDFService} from '../../../back/PDFService';
let jsPDF = require('jsPDF');

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
        })

        PDFLog.findAll({
                include: [WasteLog]
            })
            .then(logs => {
                return this.pdfLogs = logs;
            })
            .then(logs => this.writeLogs(logs));
    }

    readerForFile(file) {
        if (!this.readerCache.hasOwnProperty(file)) {
            this.readerCache[file] = hummus.createReader(file);
        }

        return this.readerCache[file];
    }

    writeToLog(log, canvas, pdfContext, pdf) {
        let context = canvas.getContext('2d');
        let viewport = pdfContext.viewport;
        for(var field in this.layout) {
            let positions = this.layout[field];

            var data = log.waste_log[field];

            positions.forEach(position => {
                context.font = "20px Roboto";
                context.fillText(data, position.x * viewport.width, position.y * viewport.height);
            });
        }

        let imageData = canvas.toDataURL('image/jpeg');
        pdf.addImage(imageData, 'JPEG', 0, 0);
    }

    writeLogs() {
        let wholePDF = new jsPDF();
        let finishedCount = 0;
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

                        if(!addedPage) {addedPage = true}

                        finishedCount++;

                        if(finishedCount == this.pdfLogs.length) {
                            wholePDF.save(appRoot + '/files/done.pdf');
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
